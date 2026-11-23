"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderTrackingAction } from "@/app/actions/order";
import { ALL_STATUSES, CARRIERS, STATUS_LABEL } from "@/lib/order-status";

interface Props {
  orderId: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null; // yyyy-mm-dd
}

const field =
  "h-8 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

// Inline editor used in the admin orders table.
export function AdminStatusForm(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.status);
  const [carrier, setCarrier] = useState(props.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(props.trackingNumber ?? "");
  const [eta, setEta] = useState(props.estimatedDelivery ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await updateOrderTrackingAction(props.orderId, {
      status,
      carrier,
      trackingNumber,
      estimatedDelivery: eta,
      note,
    });
    setBusy(false);
    if ("error" in res && res.error) {
      setMessage({ ok: false, text: res.error });
    } else {
      setNote("");
      setMessage({ ok: true, text: "Saved" });
      router.refresh();
    }
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-center gap-2">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={field}>
        <option value="">Carrier…</option>
        {CARRIERS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking #"
        className={`${field} w-32`}
      />
      <input
        type="date"
        value={eta}
        onChange={(e) => setEta(e.target.value)}
        title="Estimated delivery"
        className={field}
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className={`${field} w-36`}
      />
      <button
        type="submit"
        disabled={busy}
        className="h-8 rounded-md bg-neutral-900 px-3 text-xs font-medium text-white dark:bg-pink-600 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Update"}
      </button>
      {message && (
        <span className={`text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
    </form>
  );
}
