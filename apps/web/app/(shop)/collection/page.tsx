"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number | string;
  images: string[];
  gender: string;
  category: { name: string; slug: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { value: "men",   label: "Men"   },
  { value: "women", label: "Women" },
  { value: "kids",  label: "Kids"  },
];

const TYPE_FILTERS = [
  { value: "tops",       label: "Topwear"   },
  { value: "bottoms",    label: "Bottomwear"},
  { value: "outerwear",  label: "Winterwear"},
  { value: "dresses",    label: "Dresses"   },
  { value: "activewear", label: "Activewear"},
  { value: "accessories",label: "Accessories"},
];

const SORT_OPTIONS = [
  { value: "relevant",   label: "Relevant"          },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest",     label: "Newest First"       },
];

// ─── Mock product data (shown when DB has no products) ───────────────────────
const DEMO_PRODUCTS: Product[] = [
  { id: "1", name: "Men Round Neck Pure Cotton T-shirt", slug: "men-cotton-tee",       basePrice: 80,  images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"], gender: "men",   category: { name: "Tops",     slug: "tops"     } },
  { id: "2", name: "Men Tapered Fit Flat-Front Trousers", slug: "men-trousers",        basePrice: 72,  images: ["https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400&q=80"], gender: "men",   category: { name: "Bottoms",  slug: "bottoms"  } },
  { id: "3", name: "Women Round Neck Cotton Top",         slug: "women-cotton-top",    basePrice: 36,  images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80"], gender: "women", category: { name: "Tops",     slug: "tops"     } },
  { id: "4", name: "Women Round Neck Cotton Top",         slug: "women-cotton-top-2",  basePrice: 30,  images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"], gender: "women", category: { name: "Tops",     slug: "tops"     } },
  { id: "5", name: "Men Slim Fit Jeans",                  slug: "men-slim-jeans",      basePrice: 65,  images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80"], gender: "men",   category: { name: "Bottoms",  slug: "bottoms"  } },
  { id: "6", name: "Men Hooded Jacket",                   slug: "men-hooded-jacket",   basePrice: 110, images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&q=80"], gender: "men",   category: { name: "Outerwear",slug: "outerwear"} },
  { id: "7", name: "Women Dotted Print Trousers",         slug: "women-dotted-trouser",basePrice: 45,  images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"], gender: "women", category: { name: "Bottoms",  slug: "bottoms"  } },
  { id: "8", name: "Kids Graphic Printed Vest",           slug: "kids-graphic-vest",   basePrice: 25,  images: ["https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80"], gender: "kids",  category: { name: "Tops",     slug: "tops"     } },
  { id: "9", name: "Women Floral Maxi Dress",             slug: "women-floral-dress",  basePrice: 95,  images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80"], gender: "women", category: { name: "Dresses",  slug: "dresses"  } },
  { id:"10", name: "Men Parka Winter Coat",               slug: "men-parka-coat",      basePrice: 150, images: ["https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&q=80"], gender: "men",   category: { name: "Outerwear",slug: "outerwear"} },
  { id:"11", name: "Kids Colourblock Hoodie",             slug: "kids-hoodie",         basePrice: 38,  images: ["https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400&q=80"], gender: "kids",  category: { name: "Outerwear",slug: "outerwear"} },
  { id:"12", name: "Women Ribbed Knit Sweater",           slug: "women-ribbed-sweater",basePrice: 78,  images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80"], gender: "women", category: { name: "Tops",     slug: "tops"     } },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const price = typeof product.basePrice === "number"
    ? product.basePrice
    : Number(product.basePrice);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
            👕
          </div>
        )}
        {/* Quick-add overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs font-semibold text-center py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer">
          + Quick Add
        </div>
      </div>

      {/* Info */}
      <p className="text-[13px] text-gray-700 leading-snug font-medium line-clamp-2 mb-1">
        {product.name}
      </p>
      <p className="text-[13px] font-bold text-gray-900">${price}</p>
    </Link>
  );
}

// ─── Checkbox component ───────────────────────────────────────────────────────
function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <span
        onClick={onChange}
        className={`w-4 h-4 border rounded flex items-center justify-center transition-colors shrink-0 ${
          checked
            ? "bg-gray-900 border-gray-900"
            : "border-gray-400 group-hover:border-gray-700"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        onClick={onChange}
        className={`text-sm transition-colors ${checked ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CollectionPage() {
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [filtered, setFiltered] = useState<Product[]>(DEMO_PRODUCTS);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [sort, setSort] = useState("relevant");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real products from DB
  useEffect(() => {
    fetch("/api/products/all")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
          setFiltered(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Apply filters + sort whenever state changes
  const applyFilters = useCallback(() => {
    let result = [...allProducts];

    if (categories.length > 0) {
      result = result.filter((p) => categories.includes(p.gender?.toLowerCase()));
    }
    if (types.length > 0) {
      result = result.filter((p) => types.includes(p.category?.slug?.toLowerCase()));
    }

    // Sort
    if (sort === "price-asc")  result.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    if (sort === "price-desc") result.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    if (sort === "newest")     result.sort((a, b) => a.id > b.id ? -1 : 1);

    setFiltered(result);
  }, [allProducts, categories, types, sort]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  function toggleCategory(val: string) {
    setCategories((prev) => prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]);
  }
  function toggleType(val: string) {
    setTypes((prev) => prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]);
  }
  function clearAll() {
    setCategories([]);
    setTypes([]);
    setSort("relevant");
  }

  const hasFilters = categories.length > 0 || types.length > 0;

  // Sidebar content
  const Sidebar = () => (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-700" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* CATEGORIES */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-3">Categories</p>
        <div className="space-y-2">
          {CATEGORY_FILTERS.map((f) => (
            <FilterCheck
              key={f.value}
              label={f.label}
              checked={categories.includes(f.value)}
              onChange={() => toggleCategory(f.value)}
            />
          ))}
        </div>
      </div>

      {/* TYPE */}
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-3">Type</p>
        <div className="space-y-2">
          {TYPE_FILTERS.map((f) => (
            <FilterCheck
              key={f.value}
              label={f.label}
              checked={types.includes(f.value)}
              onChange={() => toggleType(f.value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Collection</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* ── LEFT SIDEBAR (desktop) ─────────────────── */}
          <div className="hidden md:block w-56 shrink-0">
            <Sidebar />
          </div>

          {/* ── RIGHT MAIN CONTENT ─────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  className="md:hidden flex items-center gap-1.5 text-xs font-semibold border border-gray-300 rounded-full px-3 py-1.5 hover:border-gray-500 transition-colors"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters {hasFilters && `(${categories.length + types.length})`}
                </button>

                <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase flex items-center gap-2">
                  All{" "}
                  <span className="text-pink-500">Collections</span>
                  <span className="hidden sm:inline-block h-px w-12 bg-gray-400 ml-1" />
                </h1>
              </div>

              {/* Sort dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-sm border border-gray-300 rounded px-3 py-1.5 pr-7 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>Sort by: {s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((c) => (
                  <span
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className="flex items-center gap-1 text-xs bg-gray-900 text-white rounded-full px-3 py-1 cursor-pointer hover:bg-pink-600 transition-colors"
                  >
                    {CATEGORY_FILTERS.find((f) => f.value === c)?.label}
                    <X className="w-3 h-3" />
                  </span>
                ))}
                {types.map((t) => (
                  <span
                    key={t}
                    onClick={() => toggleType(t)}
                    className="flex items-center gap-1 text-xs bg-gray-900 text-white rounded-full px-3 py-1 cursor-pointer hover:bg-pink-600 transition-colors"
                  >
                    {TYPE_FILTERS.find((f) => f.value === t)?.label}
                    <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}

            {/* Product count */}
            <p className="text-xs text-gray-400 mb-5">
              Showing <strong className="text-gray-700">{filtered.length}</strong> products
            </p>

            {/* Product Grid — exactly like the reference image */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100 rounded mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-4xl mb-4">🛍️</p>
                <p className="text-gray-500 font-medium">No products match your filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-4 text-sm text-pink-500 underline hover:text-pink-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ──────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-gray-900">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <Sidebar />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-6 bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-pink-600 transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
