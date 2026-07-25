"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  user: { name: string | null };
  createdAt: Date;
}

const TABS = [
  { id: "description", label: "Description" },
  { id: "additional", label: "Additional Information" },
  { id: "shipping", label: "Shipping" },
  { id: "whybuy", label: "Why Buy From Us" },
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductTabs({
  description,
  reviews,
  fitSummary,
  avgRating,
}: {
  description: string | null;
  reviews: Review[];
  fitSummary: { summary: string; rationale: string } | null;
  avgRating: number | null;
}) {
  const [active, setActive] = useState<TabId>("description");

  return (
    <div id="reviews-tab">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
              active === tab.id
                ? "border-[#e6186c] text-[#e6186c]"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-8">

        {/* Description */}
        {active === "description" && (
          <div className="prose prose-sm max-w-none text-gray-600">
            {description ? (
              <>
                <p className="leading-relaxed">{description}</p>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <ul className="space-y-1.5 text-sm">
                    <li>• Fabric 1: 100% Polyester</li>
                    <li>• Fabric 2: 75% Polyester, 22% Viscose, 5% Elastane</li>
                    <li>• Fabric 3: 100% Polyester Lining; 100% Polyester</li>
                    <li>• Fabric 4: 75% Polyester, 20% Viscose, 5% Elastane</li>
                    <li>• Fabric 5: 100% Polyester</li>
                  </ul>
                  <ul className="space-y-1.5 text-sm">
                    <li>• Lining: 100% Polyester</li>
                    <li>• Machine washable</li>
                    <li>• Do not tumble dry</li>
                    <li>• Iron on reverse</li>
                    <li>• Dry clean recommended</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No description available.</p>
            )}
          </div>
        )}

        {/* Additional Information */}
        {active === "additional" && (
          <div className="text-sm text-gray-600 max-w-lg">
            <table className="w-full border-collapse">
              <tbody>
                {[
                  ["Material", "100% Premium Fabric"],
                  ["Weight", "0.5 kg"],
                  ["Dimensions", "Standard sizing"],
                  ["Care Instructions", "Machine wash cold, tumble dry low"],
                  ["Country of Origin", "Made in USA"],
                ].map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2.5 pr-8 font-medium text-gray-800 w-40">{key}</td>
                    <td className="py-2.5 text-gray-600">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shipping */}
        {active === "shipping" && (
          <div className="space-y-4 text-sm text-gray-600 max-w-xl">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">🚚 Delivery Options</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Standard Shipping (5–7 business days)</span>
                  <span className="font-medium text-gray-900">$4.99</span>
                </li>
                <li className="flex justify-between">
                  <span>Express Shipping (2–3 business days)</span>
                  <span className="font-medium text-gray-900">$9.99</span>
                </li>
                <li className="flex justify-between">
                  <span>Overnight Delivery</span>
                  <span className="font-medium text-gray-900">$19.99</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">📦 Free Shipping</h3>
              <p>Orders over $75 qualify for free standard shipping within the continental US.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Returns & Exchanges</h3>
              <p>We offer free 30-day returns on all unworn, unwashed items with original tags attached.</p>
            </div>
          </div>
        )}

        {/* Why Buy From Us */}
        {active === "whybuy" && (
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: "🏆", title: "Premium Quality", desc: "Every product is carefully curated and quality-checked before shipping." },
              { icon: "🔒", title: "Secure Checkout", desc: "Your payment information is always protected with 256-bit SSL encryption." },
              { icon: "🌍", title: "Sustainable Fashion", desc: "We partner with eco-conscious brands to reduce our environmental footprint." },
              { icon: "💬", title: "Expert Support", desc: "Our styling team is available 7 days a week to help you find the perfect fit." },
              { icon: "🔄", title: "Easy Returns", desc: "30-day hassle-free returns on all items — no questions asked." },
              { icon: "📦", title: "Fast Delivery", desc: "Same-day dispatch on orders placed before 2 PM, Monday to Friday." },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {active === "reviews" && (
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-lg font-medium text-gray-600 mb-1">No reviews yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Fit Summary from AI */}
                {fitSummary && fitSummary.summary !== "No reviews yet" && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm font-semibold text-indigo-700 mb-1">
                      ✨ AI Fit Advisor
                    </p>
                    <p className="text-sm text-indigo-600">{fitSummary.rationale}</p>
                  </div>
                )}

                {/* Average rating */}
                {avgRating !== null && (
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <div>
                      <div className="flex mb-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(avgRating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Individual reviews */}
                <ul className="space-y-5">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-gray-100 pb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        {r.title && (
                          <span className="text-sm font-semibold text-gray-800">{r.title}</span>
                        )}
                      </div>
                      {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                      <p className="mt-1.5 text-xs text-gray-400">
                        — {r.user.name ?? "Verified buyer"} &nbsp;·&nbsp;{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
