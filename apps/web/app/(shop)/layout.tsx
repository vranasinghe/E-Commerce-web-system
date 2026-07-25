import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CompareProvider } from "@/lib/compare-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ai/ChatWidget";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          <Header />
          <main className="mx-auto min-h-[70vh] max-w-7xl px-4 pb-8">
            {children}
          </main>
          <Footer />
          <ChatWidget />
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
