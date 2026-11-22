// Non-destructive: adds the women's catalog products if they are missing and
// restocks any of their variants that are at zero stock. Unlike `db:seed`, it
// never deletes users, orders or other products.
//
//   npm run db:add-womens-catalog              # dry run, shows what would change
//   npm run db:add-womens-catalog -- --apply   # writes the changes
//
// Uses DATABASE_URL from the environment (set it to the target database).
import { PrismaClient, Prisma } from "@prisma/client";
import { WOMENS_CATALOG, WOMENS_CATALOG_STOCK } from "./womens-catalog";

const SIZES = ["XS", "S", "M", "L", "XL"];
const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();

async function main() {
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").host;
    } catch {
      return "(unknown)";
    }
  })();
  console.log(`${apply ? "APPLYING to" : "DRY RUN against"} database host: ${host}\n`);

  for (const p of WOMENS_CATALOG) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      include: { variants: true },
    });

    if (!existing) {
      const category = await prisma.category.findUnique({ where: { slug: p.category } });
      if (!category) {
        console.log(`✗ ${p.name}: category "${p.category}" not found, skipped`);
        continue;
      }
      console.log(`+ ${p.name}: create with ${SIZES.length * p.colors.length} variants @ stock ${WOMENS_CATALOG_STOCK}`);
      if (apply) {
        await prisma.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            brand: p.brand,
            gender: p.gender,
            basePrice: new Prisma.Decimal(p.basePrice),
            images: p.images,
            categoryId: category.id,
            variants: {
              create: SIZES.flatMap((size) =>
                p.colors.map((color) => ({
                  sku: `${p.slug}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-"),
                  size,
                  color,
                  stock: WOMENS_CATALOG_STOCK,
                  price: new Prisma.Decimal(p.basePrice),
                })),
              ),
            },
          },
        });
      }
      continue;
    }

    const empty = existing.variants.filter((v) => v.stock <= 0);
    if (empty.length === 0) {
      console.log(`= ${p.name}: already in stock, nothing to do`);
      continue;
    }
    console.log(`↑ ${p.name}: restock ${empty.length} of ${existing.variants.length} variants to ${WOMENS_CATALOG_STOCK}`);
    if (apply) {
      await prisma.productVariant.updateMany({
        where: { productId: existing.id, stock: { lte: 0 } },
        data: { stock: WOMENS_CATALOG_STOCK },
      });
    }
  }

  console.log(apply ? "\n✅ Done." : "\nDry run only. Re-run with --apply to write these changes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
