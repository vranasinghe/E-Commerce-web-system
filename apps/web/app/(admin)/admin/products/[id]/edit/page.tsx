import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { EditProductForm } from "./EditProductForm";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Convert Decimal fields for client component props serialization
  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  };

  return <EditProductForm product={serializedProduct} />;
}
