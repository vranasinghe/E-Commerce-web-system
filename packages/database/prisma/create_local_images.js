const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'apps/web/public/images/products');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const products = [
  { slug: "classic-cotton-tee", title: "Classic Cotton Tee", cat: "Tops", color1: "#fdf2f8", color2: "#fce7f3", accent: "#ec4899" },
  { slug: "ribbed-knit-top", title: "Ribbed Knit Top", cat: "Tops", color1: "#f0fdf4", color2: "#dcfce7", accent: "#22c55e" },
  { slug: "oversized-boxy-tee", title: "Oversized Boxy Tee", cat: "Tops", color1: "#eff6ff", color2: "#dbeafe", accent: "#3b82f6" },
  { slug: "silk-camisole", title: "Silk Camisole", cat: "Tops", color1: "#fff7ed", color2: "#ffedd5", accent: "#f97316" },
  { slug: "linen-button-shirt", title: "Linen Button Shirt", cat: "Tops", color1: "#faf5ff", color2: "#f3e8ff", accent: "#a855f7" },
  { slug: "wrap-midi-dress", title: "Wrap Midi Dress", cat: "Dresses", color1: "#fdf2f8", color2: "#fbcfe8", accent: "#db2777" },
  { slug: "slip-satin-dress", title: "Slip Satin Dress", cat: "Dresses", color1: "#fff1f2", color2: "#ffe4e6", accent: "#e11d48" },
  { slug: "cotton-shirt-dress", title: "Cotton Shirt Dress", cat: "Dresses", color1: "#f0fdfa", color2: "#ccfbf1", accent: "#0d9488" },
  { slug: "knit-sweater-dress", title: "Knit Sweater Dress", cat: "Dresses", color1: "#fefce8", color2: "#fef08a", accent: "#ca8a04" },
  { slug: "floral-tea-dress", title: "Floral Tea Dress", cat: "Dresses", color1: "#fdf2f8", color2: "#fce7f3", accent: "#e11d48" },
  { slug: "tapered-trousers", title: "Tapered Trousers", cat: "Bottoms", color1: "#f8fafc", color2: "#e2e8f0", accent: "#475569" },
  { slug: "slim-fit-jeans", title: "Slim Fit Jeans", cat: "Bottoms", color1: "#eff6ff", color2: "#bfdbfe", accent: "#2563eb" },
  { slug: "wide-leg-trousers", title: "Wide Leg Trousers", cat: "Bottoms", color1: "#fafaf9", color2: "#e7e5e4", accent: "#57534e" },
  { slug: "pleated-midi-skirt", title: "Pleated Midi Skirt", cat: "Bottoms", color1: "#fdf2f8", color2: "#fbcfe8", accent: "#db2777" },
  { slug: "linen-shorts", title: "Linen Shorts", cat: "Bottoms", color1: "#fffbeb", color2: "#fde68a", accent: "#d97706" },
  { slug: "wool-tailored-blazer", title: "Wool Tailored Blazer", cat: "Outerwear", color1: "#f1f5f9", color2: "#cbd5e1", accent: "#334155" },
  { slug: "trench-coat", title: "Trench Coat", cat: "Outerwear", color1: "#fff7ed", color2: "#fed7aa", accent: "#c2410c" },
  { slug: "biker-leather-jacket", title: "Biker Leather Jacket", cat: "Outerwear", color1: "#f8fafc", color2: "#cbd5e1", accent: "#0f172a" },
  { slug: "puffer-jacket", title: "Puffer Jacket", cat: "Outerwear", color1: "#ecfeff", color2: "#cffafe", accent: "#0891b2" },
  { slug: "denim-jacket", title: "Denim Jacket", cat: "Outerwear", color1: "#f0f9ff", color2: "#bae6fd", accent: "#0284c7" }
];

function generateSvg(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="bg-${item.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.color1}"/>
      <stop offset="100%" stop-color="${item.color2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-${item.slug})"/>
  <circle cx="400" cy="440" r="160" fill="${item.accent}" opacity="0.12"/>
  <g transform="translate(400, 420) scale(1.8)" fill="none" stroke="${item.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-40 -60 L40 -60 L60 -10 L40 -10 L40 70 L-40 70 L-40 -10 L-60 -10 Z" fill="${item.accent}" fill-opacity="0.2"/>
    <path d="M-20 -60 Q0 -30 20 -60" />
  </g>
  <text x="400" y="660" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="#1e293b" text-anchor="middle">${item.title}</text>
  <text x="400" y="705" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="${item.accent}" text-anchor="middle">${item.cat.toUpperCase()}</text>
  <rect x="320" y="735" width="160" height="3" rx="1.5" fill="${item.accent}" opacity="0.5"/>
</svg>`;
}

for (const p of products) {
  const filePath = path.join(dir, `${p.slug}.svg`);
  fs.writeFileSync(filePath, generateSvg(p));
}

// Default placeholder
fs.writeFileSync(path.join(dir, 'placeholder.svg'), generateSvg({
  slug: 'placeholder', title: 'AURA COLLECTION', cat: 'FASHION', color1: '#fdf2f8', color2: '#fce7f3', accent: '#ec4899'
}));

console.log('Successfully created local product SVGs!');
