/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { X, Upload, Sparkles, Image as ImageIcon, Download } from "lucide-react";
import { Button } from "@repo/ui";

interface TryOnModalProps {
  productName: string;
  garmentImage: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TryOnModal({ productName, garmentImage, isOpen, onClose }: TryOnModalProps) {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserPhoto(file);
      setUserPhotoUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUserPhoto(file);
      setUserPhotoUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const runTryOn = async () => {
    if (!userPhoto) return;
    setLoading(true);
    setJobStatus("Enqueuing job...");

    try {
      const garmentRes = await fetch(garmentImage);
      const garmentBlob = await garmentRes.blob();
      const garmentFile = new File([garmentBlob], "garment.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("user_image", userPhoto);
      formData.append("garment_image", garmentFile);

      const res = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Generation initiation failed");
      }

      const { job_id } = await res.json();
      setJobStatus("Job enqueued (Pending)");

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/tryon/status/${job_id}`);
          if (!statusRes.ok) throw new Error("Status check failed");
          
          const { status, error } = await statusRes.json();
          if (status === "PROCESSING") {
            setJobStatus("Processing virtual try-on...");
          } else if (status === "COMPLETED") {
            clearInterval(pollInterval);
            setResultImage(`/api/tryon/result/${job_id}`);
            setLoading(false);
          } else if (status === "FAILED") {
            clearInterval(pollInterval);
            setLoading(false);
            alert(`Virtual Try-On task failed: ${error || "Unknown error"}`);
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert("Try-on initiation failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 fill-indigo-100 animate-pulse" />
            <h2 className="text-lg font-semibold text-neutral-800">AURA AI Virtual Try-On</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!resultImage ? (
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Left Column: Garment Image Preview */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Garment Selection</p>
                <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-lg shadow-sm">
                  <img src={garmentImage} alt={productName} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-sm font-medium text-neutral-800 text-center">{productName}</p>
              </div>

              {/* Right Column: User Selfie Upload */}
              <div className="flex flex-col">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-center md:text-left">Your Photo</p>
                
                {userPhotoUrl ? (
                  <div className="relative flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed border-neutral-200 p-4">
                    <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-lg shadow-md bg-white">
                      <img src={userPhotoUrl} alt="Selfie preview" className="h-full w-full object-cover" />
                      {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center">
                          <Sparkles className="h-8 w-8 text-indigo-400 animate-spin mb-2" />
                          <p className="text-xs font-semibold animate-pulse">{jobStatus}</p>
                          <p className="text-[10px] text-neutral-300 mt-1">Asynchronous thread queue task</p>
                        </div>
                      )}
                    </div>
                    {!loading && (
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded bg-indigo-50"
                        >
                          Change Photo
                        </button>
                        <Button onClick={runTryOn} size="sm" className="flex items-center gap-1 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" /> Try It On
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center flex-1 rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-400 cursor-pointer bg-neutral-50 hover:bg-neutral-100/50 p-8 text-center transition-all duration-200 min-h-[220px]"
                  >
                    <Upload className="h-10 w-10 text-neutral-400 mb-3" />
                    <p className="text-sm font-semibold text-neutral-700">Upload a selfie or portrait</p>
                    <p className="text-xs text-neutral-400 mt-1">Drag and drop, or click to browse</p>
                    <p className="text-[10px] text-neutral-400 mt-4 bg-white border border-neutral-200 px-2.5 py-1 rounded-full shadow-2xs">
                      For best results, use a well-lit front-facing portrait
                    </p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

            </div>
          ) : (
            /* Try-On Result View */
            <div className="flex flex-col items-center justify-center py-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Generated Try-On Result</p>
              <div className="relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-xl shadow-lg border border-neutral-200 bg-white">
                <img src={resultImage} alt="Try on result" className="h-full w-full object-cover" />
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setResultImage(null)}
                  className="text-sm text-neutral-500 hover:text-neutral-800 font-medium px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
                >
                  Try Another Photo
                </button>
                <a
                  href={resultImage}
                  download="aura-tryon-look.jpg"
                  className="flex items-center gap-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 font-medium px-4 py-2 rounded-lg transition shadow"
                >
                  <Download className="h-4 w-4" /> Save Look
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
