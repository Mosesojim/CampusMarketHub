import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../pages/VendorDashboard";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

interface CartContextType {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const { user } = useAuth();

  // Load from Supabase or localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('product_id, products(*)');
            
          if (error) throw error;
          
          if (data) {
            const items = data.map((d: any) => d.products).filter(Boolean);
            setCartItems(items);
            localStorage.setItem("campusmarket_cart", JSON.stringify(items));
          }
        } catch (err) {
          // console.warn('Supabase cart fetch failed, using local', err);
          const saved = localStorage.getItem("campusmarket_cart");
          if (saved) setCartItems(JSON.parse(saved));
        }
      } else {
        const saved = localStorage.getItem("campusmarket_cart");
        if (saved) setCartItems(JSON.parse(saved));
      }
    };
    fetchCart();
  }, [user]);

  const addToCart = async (product: Product) => {
    setCartItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      const updated = [...prev, product];
      localStorage.setItem("campusmarket_cart", JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id
        });
      } catch (err) {
        // console.warn("Failed to add to supabase cart", err);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      localStorage.setItem("campusmarket_cart", JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId);
      } catch (err) {
        // console.warn("Failed to remove from supabase cart", err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("campusmarket_cart");
    
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (err) {
        // console.warn("Failed to clear supabase cart", err);
      }
    }
  };
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
