"use client";

import { useTransition } from "react";
import { deleteProductAction } from "@/app/actions/product";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProductActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteProductAction(productId);
        if (res?.error) {
          alert(res.error);
        } else {
          router.refresh();
        }
      });
    }
  };

  const handleEdit = () => {
    // Currently just an alert, normally would navigate to an edit page
    alert("Edit product functionality coming soon!");
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={handleEdit}
        disabled={isPending}
        className="px-3 py-1 text-xs font-medium text-pink-600 bg-pink-50 rounded-md hover:bg-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:hover:bg-pink-500/20 transition-colors disabled:opacity-50"
      >
        Edit
      </button>
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        Delete
      </button>
    </div>
  );
}
