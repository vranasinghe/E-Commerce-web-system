"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, X, Save, ImageIcon, Tag, Package,
  Star, ChevronLeft, Loader2, CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { updateProductAction } from "@/app/actions/product";

const CATEGORIES: Record<string, string[]> = {
  men:    ["Tops", "Bottoms", "Outerwear", "Suits", "Activewear", "Accessories"],
  women:  ["Tops", "Dresses", "Bottoms", "Outerwear", "Activewear", "Accessories"],
  kids:   ["Tops", "Bottoms", "Outerwear", "Sets", "Activewear", "Accessories"],
  unisex: ["Tops", "Bottoms", "Outerwear", "Activewear", "Accessories"],
};

const SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  "White","Black","Navy","Ivory","Stone","Sage","Rust",
  "Champagne","Charcoal","Olive","Camel","Indigo","Forest",
  "Blush","Slate","Sky","Wine","Oatmeal",
];

interface ProductData {
  id: string;
  name: string;
  description: string;
  brand?: string | null;
  gender?: string | null;
  basePrice: number | string;
  featured: boolean;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  variants: Array<{
    size: string;
    color: string;
    stock: number;
    price: number | string;
  }>;
}

export function EditProductForm({ product }: { product: ProductData }) {
  const router = useRouter();

  // Extract initial sizes and colors from product variants
  const initialSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const initialColors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Extract clean subcategory slug
  const rawSlug = product.category.slug.toLowerCase();
  const genderKey = (product.gender || "women").toLowerCase();
  const cleanCategorySlug = rawSlug.startsWith(`${genderKey}-`)
    ? rawSlug.split("-")[1] || rawSlug
    : rawSlug.split("-")[0] || rawSlug;

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [brand, setBrand] = useState(product.brand || "");
  const [gender, setGender] = useState(genderKey);
  const [categorySlug, setCategorySlug] = useState(cleanCategorySlug);
  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialSizes.length > 0 ? initialSizes : ["M"]
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialColors.length > 0 ? initialColors : ["Black"]
  );
  const [featured, setFeatured] = useState(product.featured);

  // Pre-fill slot previews/URLs from existing images
  const initialSlots = [0, 1, 2, 3].map((i) => ({
    preview: product.images[i] || null,
    urlInput: product.images[i] || "",
  }));
  const [slots, setSlots] = useState(initialSlots);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  function getRef(i: number): React.RefObject<HTMLInputElement> {
    if (i === 0) return ref0;
    if (i === 1) return ref1;
    if (i === 2) return ref2;
    return ref3;
  }

  async function handleFile(index: number, file: File) {
    setUploadingSlot(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSlots((prev) => {
        const next = [...prev];
        next[index] = { preview: data.url, urlInput: data.url };
        return next;
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingSlot(null);
    }
  }

  function clearSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { preview: null, urlInput: "" };
      return next;
    });
    const r = getRef(index);
    if (r.current) r.current.value = "";
  }

  function setUrl(index: number, value: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { preview: value.trim() ? value.trim() : null, urlInput: value };
      return next;
    });
  }

  const toggleSize = (s: string) =>
    setSelectedSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleColor = (c: string) =>
    setSelectedColors((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (!name.trim() || !description.trim() || !basePrice) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    if (selectedSizes.length === 0) {
      setErrorMsg("Please select at least one size.");
      setStatus("error");
      return;
    }

    const images = slots
      .map((s) => (s.urlInput.trim() || s.preview?.trim() || ""))
      .filter((u) => u.length > 0 && !u.startsWith("blob:"));

    try {
      const payload = {
        name,
        description,
        brand,
        gender,
        categorySlug: categorySlug.toLowerCase(),
        basePrice,
        sizes: selectedSizes,
        colors: selectedColors,
        featured,
        images,
      };

      const res = await updateProductAction(product.id, payload);
      if (res?.error) {
        throw new Error(res.error);
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="font-sans max-w-4xl mx-auto transition-colors duration-300">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Product</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Dashboard &rsaquo; Products &rsaquo;{" "}
            <span className="text-pink-500">Edit ({product.name})</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Images ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-pink-500" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Product Images</h2>
            <span className="text-xs text-gray-400 ml-auto">Up to 4 images</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {slots.map((slot, i) => (
              <div key={i} className="relative group aspect-square">
                <input
                  ref={getRef(i)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f !== undefined) handleFile(i, f);
                  }}
                />

                {uploadingSlot === i ? (
                  <div className="w-full h-full rounded-xl border-2 border-pink-200 dark:border-pink-500/30 flex flex-col items-center justify-center gap-1.5 bg-pink-50/50 dark:bg-pink-500/5">
                    <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                    <span className="text-[10px] text-pink-500 font-medium">Uploading...</span>
                  </div>
                ) : slot.preview || slot.urlInput ? (
                  <div className="w-full h-full rounded-xl overflow-hidden border-2 border-pink-200 dark:border-pink-500/30 relative">
                    <Image src={slot.preview || slot.urlInput} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => clearSlot(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => getRef(i).current?.click()}
                    className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1.5 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-500/5 transition-all group/btn"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover/btn:bg-pink-100 dark:group-hover/btn:bg-pink-500/10 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-gray-400 group-hover/btn:text-pink-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover/btn:text-pink-400 font-medium">Upload</span>
                  </button>
                )}
              </div>
            ))}
          </div>


          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Or paste image URLs:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {slots.map((slot, i) => (
                <input
                  key={i}
                  type="url"
                  placeholder={`Image URL ${i + 1} (https://...)`}
                  value={slot.urlInput}
                  onChange={(e) => setUrl(i, e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Product Details ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-pink-500" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Product Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Product Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Product Description <span className="text-pink-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition resize-none"
              />
            </div>
          </div>
        </section>

        {/* ── Category & Price ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-pink-500" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Category &amp; Pricing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Gender <span className="text-pink-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setCategorySlug((CATEGORIES[e.target.value]?.[0] ?? "tops").toLowerCase());
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition appearance-none cursor-pointer"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sub Category <span className="text-pink-500">*</span>
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition appearance-none cursor-pointer"
              >
                {(CATEGORIES[gender] ?? []).map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price (USD) <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-7 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Sizes ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Product Sizes</h2>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    active
                      ? "bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-200 dark:shadow-pink-900/30"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-300 hover:text-pink-500"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {selectedSizes.length === 0 && (
            <p className="text-xs text-amber-500 mt-2">Select at least one size.</p>
          )}
        </section>

        {/* ── Colors ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Available Colors</h2>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => {
              const active = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    active
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-300 hover:text-pink-500"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Featured toggle ── */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Options</h2>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setFeatured((f) => !f)}
          >
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-300 relative shrink-0 ${
                featured ? "bg-pink-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  featured ? "left-6" : "left-1"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Star
                  className={`w-4 h-4 ${
                    featured ? "fill-amber-400 text-amber-400" : "text-gray-400"
                  }`}
                />
                Add to Bestsellers
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Feature this product on the homepage
              </p>
            </div>
          </div>
        </section>

        {/* ── Feedback ── */}
        {status === "error" && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}
        {status === "success" && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Product updated successfully! Redirecting...
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-pink-200 dark:shadow-pink-900/30 transition-all duration-200 text-sm cursor-pointer"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
