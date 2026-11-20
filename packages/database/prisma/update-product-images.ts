import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCT_IMAGES } from "./product-images";

const envFile = resolve(__dirname, "../../../.env");
if (!process.env.DATABASE_URL && existsSync(envFile)) {
  const match = readFileSync(envFile, "utf8").match(/^DATABASE_URL\s*=\s*"([^"]+)"\s*$/m);
  if (match) process.env.DATABASE_URL = match[1];
}

const prisma = new PrismaClient();

async function main() {
  const publicDir = resolve(__dirname, "../../../apps/web/public");
  for (const images of Object.values(PRODUCT_IMAGES)) {
    for (const image of images) {
      if (!existsSync(resolve(publicDir, image.slice(1)))) {
        throw new Error(`Missing product photo: ${image}`);
      }
    }
  }

  // Update only images on known demo products; preserve orders, users and inventory.
  const results = await prisma.$transaction(
    Object.entries(PRODUCT_IMAGES).map(([slug, images]) =>
      prisma.product.updateMany({ where: { slug }, data: { images } }),
    ),
  );
  console.log(`Updated photos for ${results.reduce((sum, result) => sum + result.count, 0)} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
