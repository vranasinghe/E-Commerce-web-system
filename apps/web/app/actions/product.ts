"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function deleteProductAction(id: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return { error: "Unauthorized" };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { error: "Failed to delete product" };
  }
}
