import { TrackLookup } from "@/components/orders/TrackLookup";

export const metadata = { title: "Track your order — AURA" };

export default function TrackPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="text-2xl font-semibold">Track your order</h1>
      <p className="mt-1 mb-8 text-sm text-neutral-500">
        Enter your order number and the email address you used at checkout. Signed-in
        customers can also see every order under{" "}
        <a href="/account/orders" className="underline">
          My orders
        </a>
        .
      </p>
      <TrackLookup initialOrderNumber={searchParams.order ?? ""} />
    </div>
  );
}
