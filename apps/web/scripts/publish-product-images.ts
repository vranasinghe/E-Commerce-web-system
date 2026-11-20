import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@repo/database";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCT_IMAGES } from "../../../packages/database/prisma/product-images";

const root = resolve(__dirname, "../../..");
const args = new Set(process.argv.slice(2));
const allowed = new Set(["--apply", "--update-database"]);
for (const arg of args) {
  if (!allowed.has(arg)) throw new Error(`Unknown option: ${arg}`);
}

// Cloud credentials are kept separate from the local development database.
const envPath = resolve(root, ".env.cloud.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const key = match[1]!;
    if (process.env[key]) continue;
    process.env[key] = match[2]!.replace(/^(["'])(.*)\1$/, "$2");
  }
}

type UploadedPhoto = {
  slug: string;
  localPath: string;
  sha256: string;
  publicId: string;
  url: string;
};

async function main() {
  const products = Object.entries(PRODUCT_IMAGES);
  const photos = products.flatMap(([slug, images]) =>
    images.map((localPath) => {
      const file = resolve(root, "apps/web/public", localPath.slice(1));
      if (!existsSync(file)) throw new Error(`Missing image: ${localPath}`);
      const sha256 = createHash("sha256").update(readFileSync(file)).digest("hex");
      const filename = localPath.split("/").pop()!.replace(/\.webp$/, "");
      return {
        slug, localPath, file, sha256,
        publicId: `ecommerce-products/catalog-v2/${slug}/${filename}-${sha256.slice(0, 12)}`,
      };
    }),
  );
  if (products.length !== 20 || photos.length !== 80 || products.some(([, images]) => images.length !== 4)) {
    throw new Error("Expected 20 products with four images each. Review the catalog mapping first.");
  }

  console.log(`Validated ${photos.length} image files for ${products.length} four-view galleries.`);
  console.log(`Cloudinary credentials: ${process.env.CLOUDINARY_URL ? "configured" : "missing"}.`);
  console.log(`Deployed database URL: ${process.env.DEPLOY_DATABASE_URL ? "configured" : "missing"}.`);
  if (!args.has("--apply")) {
    console.log("Dry run complete. No uploads or database changes made.");
    console.log("Upload: npm run images:publish -- --apply");
    console.log("Upload and update deployed records: npm run images:publish -- --apply --update-database");
    return;
  }

  if (!process.env.CLOUDINARY_URL) throw new Error("Set CLOUDINARY_URL in .env.cloud.local first.");
  let cloudUrl: URL;
  try { cloudUrl = new URL(process.env.CLOUDINARY_URL); }
  catch { throw new Error("CLOUDINARY_URL must use cloudinary://API_KEY:API_SECRET@CLOUD_NAME format."); }
  if (cloudUrl.protocol !== "cloudinary:" || !cloudUrl.hostname || !cloudUrl.username || !cloudUrl.password) {
    throw new Error("CLOUDINARY_URL requires a cloud name, API key and API secret.");
  }
  cloudinary.config({
    cloud_name: cloudUrl.hostname,
    api_key: decodeURIComponent(cloudUrl.username),
    api_secret: decodeURIComponent(cloudUrl.password),
    secure: true,
  });

  let prisma: PrismaClient | undefined;
  let previous: { id: string; slug: string; images: string[]; updatedAt: Date }[] = [];
  const localDir = resolve(root, ".local");
  mkdirSync(localDir, { recursive: true });
  try {
    if (args.has("--update-database")) {
      const databaseUrl = process.env.DEPLOY_DATABASE_URL;
      if (!databaseUrl) throw new Error("Set DEPLOY_DATABASE_URL in .env.cloud.local first.");
      let target: URL;
      try { target = new URL(databaseUrl); }
      catch { throw new Error("DEPLOY_DATABASE_URL is not a valid PostgreSQL URL."); }
      if (!["postgres:", "postgresql:"].includes(target.protocol) ||
          ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
        throw new Error("DEPLOY_DATABASE_URL must point to your deployed PostgreSQL database.");
      }
      prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
      previous = await prisma.product.findMany({
        where: { slug: { in: products.map(([slug]) => slug) } },
        select: { id: true, slug: true, images: true, updatedAt: true },
      });
      const found = new Set(previous.map((p) => p.slug));
      const missing = products.map(([slug]) => slug).filter((slug) => !found.has(slug));
      if (missing.length) throw new Error(`Deployed catalog is missing products: ${missing.join(", ")}`);
      const backup = resolve(localDir, `product-images-backup-${Date.now()}.json`);
      writeFileSync(backup, JSON.stringify({ databaseHost: target.hostname, products: previous }, null, 2));
      console.log(`Backed up existing image URLs to ${backup}.`);
    }

    const manifestPath = resolve(localDir, `cloudinary-gallery-${cloudUrl.hostname}.json`);
    const uploaded: UploadedPhoto[] = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, "utf8"))
      : [];
    const galleries: Record<string, string[]> = {};
    for (const photo of photos) {
      let result = uploaded.find((entry) => entry.publicId === photo.publicId && entry.sha256 === photo.sha256);
      if (!result) {
        // Content-based IDs make reruns safe without replacing existing assets.
        const asset = await cloudinary.uploader.upload(photo.file, {
          public_id: photo.publicId,
          resource_type: "image",
          overwrite: false,
          tags: ["aura-catalog-v2", photo.slug, "ai-generated-demo"],
        });
        if (!asset.secure_url?.startsWith("https://res.cloudinary.com/")) {
          throw new Error(`Cloudinary did not return a secure image URL for ${photo.localPath}.`);
        }
        result = {
          slug: photo.slug, localPath: photo.localPath, sha256: photo.sha256,
          publicId: photo.publicId, url: asset.secure_url,
        };
        uploaded.push(result);
        writeFileSync(manifestPath, JSON.stringify(uploaded, null, 2));
      }
      const response = await fetch(result.url, { method: "HEAD", signal: AbortSignal.timeout(20000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
        throw new Error(`Uploaded image could not be verified: ${photo.localPath}.`);
      }
      (galleries[photo.slug] ??= []).push(result.url);
      console.log(`Verified ${photo.localPath}`);
    }
    writeFileSync(resolve(localDir, `cloudinary-product-images-${cloudUrl.hostname}.json`), JSON.stringify(galleries, null, 2));
    console.log(`All ${photos.length} Cloudinary images uploaded and verified.`);

    if (prisma) {
      const db = prisma;
      await db.$transaction(async (tx) => {
        for (const before of previous) {
          const result = await tx.product.updateMany({
            where: { id: before.id, updatedAt: before.updatedAt },
            data: { images: galleries[before.slug] },
          });
          if (result.count !== 1) throw new Error(`Product ${before.slug} changed during upload. Rerun to refresh the backup.`);
        }
      });
      const verified = await db.product.findMany({
        where: { id: { in: previous.map((p) => p.id) } }, select: { slug: true, images: true },
      });
      if (verified.some((p) => JSON.stringify(p.images) !== JSON.stringify(galleries[p.slug]))) {
        throw new Error("Database image verification failed. Review the saved backup and upload manifest.");
      }
      console.log(`Updated and verified ${verified.length} deployed product galleries.`);
    }
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch((error: unknown) => {
  // Do not echo URLs or SDK errors that could contain credentials.
  const message = error instanceof Error ? error.message : "Cloud upload failed; check account access and retry.";
  const secrets = [process.env.CLOUDINARY_URL, process.env.DEPLOY_DATABASE_URL].filter(Boolean) as string[];
  console.error(secrets.reduce((text, secret) => text.split(secret).join("[redacted]"), message));
  process.exitCode = 1;
});
