/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Upload, Sparkles, Download } from "lucide-react";
import { TRYON_TIPS, type TryOnGarmentType } from "@/lib/tryon-catalog";

interface TryOnModalProps {
  productName: string;
  garmentImage: string;
  garmentColor: string;
  garmentType: TryOnGarmentType;
  /** Photo advice for this garment; defaults to the advice for its type. */
  tip?: string;
  isOpen: boolean;
  onClose: () => void;
}

function waitForPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, 1500);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

async function responseData(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail :
      typeof data.error === "string" ? data.error : "The try-on service is unavailable. Please try again.");
  }
  return data;
}

export function TryOnModal({ productName, garmentImage, garmentColor, garmentType, tip, isOpen, onClose }: TryOnModalProps) {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userPhoto) { setUserPhotoUrl(null); return; }
    const url = URL.createObjectURL(userPhoto);
    setUserPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [userPhoto]);

  useEffect(() => {
    return () => { if (resultImage) URL.revokeObjectURL(resultImage); };
  }, [resultImage]);

  useEffect(() => {
    if (!isOpen) {
      setUserPhoto(null);
      setResultImage(null);
      setError(null);
      setLoading(false);
      return;
    }
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      requestRef.current?.abort("closed");
      previousFocus?.focus();
    };
  }, [isOpen]);

  function choosePhoto(file?: File) {
    if (!file || loading) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP photo."); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Your photo must be 8 MB or smaller."); return;
    }
    setUserPhoto(file);
    setResultImage(null);
    setError(null);
  }

  async function runTryOn() {
    if (!userPhoto || loading || !garmentImage) return;
    const controller = new AbortController();
    requestRef.current?.abort("replaced");
    requestRef.current = controller;
    let timeout = setTimeout(() => controller.abort("timeout"), 150_000);
    setLoading(true);
    setError(null);
    setResultImage(null);
    setJobStatus("Preparing your preview…");
    try {
      const garmentResponse = await fetch(garmentImage, { signal: controller.signal });
      if (!garmentResponse.ok) throw new Error("The sample garment photo is unavailable. Please try again later.");
      const garment = await garmentResponse.blob();
      if (!garment.type.startsWith("image/")) throw new Error("The sample garment photo could not be loaded.");
      const body = new FormData();
      body.append("user_image", userPhoto);
      body.append("garment_image", new File([garment], "garment.webp", { type: garment.type }));
      body.append("garment_type", garmentType);
      body.append("garment_description", productName + ", " + garmentColor);
      const queued = await responseData(await fetch("/api/tryon", {
        method: "POST", body, signal: controller.signal,
      }));
      if (typeof queued.job_id !== "string" || !/^[a-f0-9-]{36}$/i.test(queued.job_id)) {
        throw new Error("The preview could not be started. Please try again.");
      }
      const seconds = Number(queued.timeout_seconds);
      clearTimeout(timeout);
      timeout = setTimeout(() => controller.abort("timeout"),
        ((Number.isFinite(seconds) ? Math.max(30, Math.min(300, seconds)) : 120) + 20) * 1000);
      setJobStatus("Creating your AI preview. Please keep this window open…");
      while (!controller.signal.aborted) {
        await waitForPoll(controller.signal);
        const status = await responseData(await fetch("/api/tryon/status/" + queued.job_id, {
          cache: "no-store", signal: controller.signal,
        }));
        if (status.status === "FAILED") throw new Error(status.error || "The preview could not be generated. Please try again.");
        if (status.status === "COMPLETED") {
          if (status.provider !== "idm-vton" && status.provider !== "ootdiffusion") throw new Error("The service could not verify an AI-generated result.");
          const result = await fetch("/api/tryon/result/" + queued.job_id, {
            cache: "no-store", signal: controller.signal,
          });
          if (!result.ok) { await responseData(result); throw new Error("The preview could not be loaded."); }
          const image = await result.blob();
          if (!image.type.startsWith("image/") || !image.size) throw new Error("The preview could not be read. Please try again.");
          if (!controller.signal.aborted) setResultImage(URL.createObjectURL(image));
          break;
        }
        if (!["PENDING", "PROCESSING"].includes(status.status)) throw new Error("The preview status could not be read. Please try again.");
      }
    } catch (failure) {
      if (controller.signal.reason === "closed" || controller.signal.reason === "replaced") return;
      setError(controller.signal.aborted
        ? "The try-on service took too long. Please try again later."
        : failure instanceof Error ? failure.message : "The AI service is unavailable. Please try again.");
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) { requestRef.current = null; setLoading(false); }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 sm:p-6">
      <section
        role="dialog" aria-modal="true" aria-labelledby="tryon-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") { onClose(); return; }
          if (event.key === "Tab") {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled])'
            )).filter((element) => element.getClientRects().length > 0);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }}
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-4 py-3 sm:px-6">
          <Sparkles className="h-5 w-5 text-neutral-700" />
          <h2 id="tryon-title" className="flex-1 text-lg font-semibold text-neutral-900">Virtual try-on</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close virtual try-on"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {!resultImage ? (
            <>
              <p className="mb-5 text-sm leading-relaxed text-neutral-600">
                {tip ?? TRYON_TIPS[garmentType]} Use JPG, PNG, or WebP, up to 8 MB.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl bg-neutral-50 p-4 text-center">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-800">Selected garment</h3>
                  <img src={garmentImage} alt={productName + " garment-only photo"}
                    className="mx-auto h-48 w-full object-contain sm:h-60" />
                  <p className="mt-3 text-sm font-medium text-neutral-900">{productName}</p>
                  <p className="mt-1 text-xs text-neutral-600">{garmentColor} sample · Preview color follows this photo.</p>
                </div>
                <div className="flex min-w-0 flex-col rounded-xl border border-dashed border-neutral-300 p-4"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); choosePhoto(event.dataTransfer.files[0]); }}>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-800">Your photo</h3>
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="Your uploaded photo" className="h-48 w-full object-contain sm:h-60" />
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-48 flex-1 flex-col items-center justify-center gap-3 rounded-lg bg-neutral-50 p-5 text-sm text-neutral-600 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2">
                      <Upload className="h-8 w-8" /> Choose a photo or drop it here
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp"
                    aria-label="Upload your try-on photo" className="hidden"
                    onChange={(event) => { choosePhoto(event.target.files?.[0]); event.target.value = ""; }} />
                  {userPhotoUrl && <button disabled={loading} onClick={() => fileInputRef.current?.click()}
                    className="mt-3 min-h-11 text-sm font-medium underline underline-offset-2 disabled:opacity-50">Change photo</button>}
                </div>
              </div>
              {loading && <p role="status" className="mt-5 rounded-lg bg-neutral-100 p-3 text-sm text-neutral-700">{jobStatus}</p>}
              {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm leading-relaxed text-red-800">{error}</p>}
              <button onClick={() => void runTryOn()} disabled={!userPhoto || loading}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <Sparkles className="h-4 w-4" />{loading ? "Creating preview…" : error ? "Try again" : "Generate AI preview"}
              </button>
            </>
          ) : (
            <div className="text-center">
              <h3 className="mb-4 font-semibold text-neutral-900">Your AI preview</h3>
              <img src={resultImage} alt="AI-generated preview of the selected garment on your photo"
                className="mx-auto max-h-[55dvh] w-full rounded-xl object-contain" />
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button onClick={() => { setResultImage(null); setError(null); }}
                  className="min-h-11 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">Try another photo</button>
                <a href={resultImage} download="aura-ai-preview.jpg"
                  className="flex min-h-11 items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
                  <Download className="h-4 w-4" />Save preview
                </a>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Your photo is sent to our external AI try-on provider. This is a style preview; actual fit and color may differ.
          </p>
        </div>
      </section>
    </div>
  );
}
