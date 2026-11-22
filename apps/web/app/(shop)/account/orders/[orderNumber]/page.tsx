import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { getSession } from "@/lib/auth";
import { toTrackedOrder, trackedOrderInclude } from "@/lib/orders";
import { OrderDetails } from "@/components/orders/OrderDetails";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const session = await getSession();
  if (!session) {
    return (
      <div className="mt-12 text-center text-red-600 font-medium">
        Please log in to see this order.
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: trackedOrderInclude,
  });

  const isStaff = session.role === "ADMIN" || session.role === "STAFF";
  // Same response for "missing" and "someone else's" so orders can't be probed.
  if (!order || (order.userId !== session.id && !isStaff)) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/account/orders" className="text-sm text-neutral-500 underline">
        ← All orders
      </Link>
      <div className="mt-4">
        <OrderDetails order={toTrackedOrder(order)} />
      </div>
    </div>
  );
}
