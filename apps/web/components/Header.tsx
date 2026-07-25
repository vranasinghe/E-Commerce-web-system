"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  LogIn,
  BarChart2,
  Phone,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";

/* ── Nav structure ─────────────────────────────────────────── */
const NAV = [
  {
    label: "Home",
    href: "/",
    children: [],
  },
  {
    label: "Collection",
    href: "/collection",
    children: [
      { label: "Women's Collection", href: "/category/women" },
      { label: "Men's Collection",   href: "/category/men"   },
      { label: "Kids' Collection",   href: "/category/kids"  },
      { label: "New Arrivals",       href: "/collection"     },
    ],
  },
  {
    label: "Pages",
    href: "#",
    children: [
      { label: "Visual Search",  href: "/visual-search" },
      { label: "Fit Finder",     href: "/fit-finder"    },
      { label: "Compare",        href: "/compare"       },
      { label: "My Account",     href: "/account/orders"},
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [],
  },
  {
    label: "Contact",
    href: "/contact",
    children: [],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [],
  },
];

/* ── Component ─────────────────────────────────────────────── */
export function Header() {
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await logoutAction();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="top-bar-inner">
          {/* Left: contact */}
          <div className="top-bar-left">
            <Phone className="h-3.5 w-3.5" />
            <span>Call: +01 321 654 214</span>
            <span className="top-bar-divider" />
            <button className="top-bar-lang">
              <span className="flag-emoji">🇺🇸</span>
              <span>Eng</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Center: promo */}
          <div className="top-bar-promo">
            <span>
              <strong>50% OFF</strong> all new collections!{" "}
              <Link href="/category/women" className="top-bar-promo-link">
                Discover Now!
              </Link>
            </span>
          </div>

          {/* Right: account links */}
          <div className="top-bar-right">
            <Link href="/account/orders" className="top-bar-action">
              <User className="h-3.5 w-3.5" />
              <span>{user ? (user.name || user.email) : "My Account"}</span>
            </Link>
            <span className="top-bar-divider" />
            <button
              onClick={() => setWishlistOpen(true)}
              className="top-bar-action bg-transparent border-0 cursor-pointer flex items-center gap-1"
              aria-label="Wishlist"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}</span>
            </button>
            <span className="top-bar-divider" />
            <Link href="/compare" className="top-bar-action">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Compare</span>
            </Link>
            <span className="top-bar-divider" />
            {user ? (
              <button onClick={handleLogout} className="top-bar-action bg-transparent border-0 cursor-pointer flex items-center gap-1">
                <LogIn className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link href="/login" className="top-bar-action">
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ────────────────────────────────────────── */}
      <header className="main-header">
        <div className="main-header-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <span className="logo-icon">◧</span>
            <span className="logo-text">AURA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="main-nav">
            {NAV.map((item) => (
              <div
                key={item.label}
                className="nav-item"
                onMouseEnter={() => item.children.length > 0 && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`nav-link${item.label === "Home" ? " nav-link-active" : ""}`}
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="h-3 w-3 ml-0.5" />}
                </Link>
                {item.children.length > 0 && openDropdown === item.label && (
                  <div className="dropdown">
                    {item.children.map((child) => (
                      <Link key={child.href + child.label} href={child.href} className="dropdown-item">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="header-icons">
            {/* Search */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="icon-btn"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist — triggers drawer */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="icon-btn relative"
              aria-label="Wishlist"
              id="wishlist-icon-btn"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="cart-badge">{wishlistCount}</span>
              )}
            </button>

            {/* Cart — triggers drawer */}
            <button
              onClick={() => setCartOpen(true)}
              className="icon-btn relative"
              aria-label="Cart"
              id="cart-icon-btn"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="cart-badge">{count}</span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="icon-btn md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Expanding search bar */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={onSearch} className="search-bar-form">
              <Search className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="mobile-menu-item"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" />
            {user && (
              <div className="mobile-menu-item font-semibold text-indigo-600">
                Hi, {user.name || user.email}
              </div>
            )}
            <Link href="/account/orders" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>My Account</Link>
            <button
              className="mobile-menu-item w-full text-left bg-transparent border-0 cursor-pointer"
              onClick={() => { setMobileOpen(false); setWishlistOpen(true); }}
            >
              Wishlist
            </button>
            <Link href="/compare" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>Compare</Link>
            {user ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mobile-menu-item w-full text-left bg-transparent border-0 cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </header>

      {/* ── DRAWERS ──────────────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />

      {/* ── STYLES ──────────────────────────────────────────── */}
      <style jsx global>{`
        /* TOP BAR */
        .top-bar {
          background: #1a1a2e;
          color: #c9c9d8;
          font-size: 12px;
          border-bottom: 1px solid #2a2a40;
        }
        .top-bar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .top-bar-left {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .top-bar-promo {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          font-size: 12px;
          letter-spacing: 0.02em;
        }
        .top-bar-promo strong {
          color: #ff6b6b;
        }
        .top-bar-promo-link {
          color: #a78bfa;
          text-decoration: underline;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .top-bar-promo-link:hover { color: #c4b5fd; }
        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .top-bar-action {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #c9c9d8;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 12px;
        }
        .top-bar-action:hover { color: #ffffff; }
        .top-bar-divider {
          width: 1px;
          height: 12px;
          background: #3a3a55;
        }
        .top-bar-lang {
          display: flex;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          color: #c9c9d8;
          cursor: pointer;
          font-size: 12px;
          padding: 0;
        }
        .flag-emoji { font-size: 14px; }

        /* MAIN HEADER */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }
        .main-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 75px;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .logo-icon {
          font-size: 24px;
          color: #1a1a2e;
        }
        .logo-text {
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #1a1a2e;
        }

        /* Desktop Nav */
        .main-nav {
          display: none;
          align-items: center;
          gap: 0;
        }
        @media (min-width: 768px) {
          .main-nav { display: flex; }
        }
        .nav-item {
          position: relative;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 0 14px;
          height: 75px;
          font-size: 14.5px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: color 0.18s, border-color 0.18s;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #e6186c;
          border-bottom-color: #e6186c;
        }
        .nav-link-active {
          color: #e6186c;
          border-bottom-color: #e6186c;
        }

        /* Dropdown */
        .dropdown {
          position: absolute;
          top: calc(100% + 2px);
          left: 0;
          min-width: 160px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          padding: 6px 0;
          z-index: 60;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dropdown-item {
          display: block;
          padding: 9px 16px;
          font-size: 13px;
          color: #374151;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .dropdown-item:hover {
          background: #fdf2f8;
          color: #e6186c;
        }

        /* Header Icons */
        .header-icons {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #374151;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover {
          background: #f3f4f6;
          color: #e11d48;
        }
        .cart-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          background: #e11d48;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }

        /* Search bar */
        .search-bar {
          border-top: 1px solid #f3f4f6;
          padding: 10px 1rem;
          background: #fff;
          animation: slideDown 0.18s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .search-bar-form {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 999px;
          padding: 6px 14px;
          background: #f9fafb;
          transition: border-color 0.2s;
        }
        .search-bar-form:focus-within { border-color: #e11d48; }
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
          color: #111827;
        }
        .search-btn {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 14px;
          border-radius: 999px;
          background: #e11d48;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: background 0.18s;
        }
        .search-btn:hover { background: #be123c; }

        /* Mobile menu */
        .mobile-menu {
          display: flex;
          flex-direction: column;
          border-top: 1px solid #f3f4f6;
          background: #fff;
          animation: slideDown 0.18s ease;
        }
        .mobile-menu-item {
          padding: 13px 1.25rem;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          border-bottom: 1px solid #f3f4f6;
          transition: color 0.15s, background 0.15s;
        }
        .mobile-menu-item:hover { color: #e11d48; background: #fff5f7; }
        .mobile-menu-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }

        @media (max-width: 767px) {
          .top-bar-left,
          .top-bar-right { display: none; }
          .top-bar-promo { text-align: center; flex: 1; }
        }
      `}</style>
    </>
  );
}
