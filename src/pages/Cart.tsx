import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Trash2, ShoppingBag, ShieldAlert, X } from "lucide-react";

import { useCart } from "../lib/cart";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { OptimizedImage } from "../components/OptimizedImage";

export function Cart() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, removeFromCart, clearCart } = useCart();
  
  
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  React.useEffect(() => {
    if (cartItems.length > 0 && !hasInitialized) {
       setSelectedItems(cartItems.map(item => item.id));
       setHasInitialized(true);
    }
  }, [cartItems, hasInitialized]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };
  
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };
  
  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price, 0);




  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

    
  const handleCheckout = async () => {
    if (agreedToTerms) {
      if (selectedCartItems.length === 0) return;
      setIsCheckoutModalOpen(false);
      
      const profiles = JSON.parse(localStorage.getItem('campusmarket_vendor_profiles') || '{}');
      
      const newOrders = selectedCartItems.map(item => {
        const vendorProfile = profiles[item.vendor_id] || {};
        const sellerDetails = {
           name: vendorProfile.name,
           phone: vendorProfile.phone || "",
           whatsapp: vendorProfile.whatsapp || "",
           address: vendorProfile.address || ""
        };
        return {
          id: "ord-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          product: { ...item, sellerDetails },
          status: "pending",
          time: new Date().toLocaleDateString(),
          sellerDetails
        };
      });
      
      const existing = JSON.parse(localStorage.getItem('campusmarket_orders') || '[]');
      localStorage.setItem('campusmarket_orders', JSON.stringify([...newOrders, ...existing]));
      
      if (user) {
        try {
          const supabaseOrders = selectedCartItems.map(item => {
            const vendorProfile = profiles[item.vendor_id] || {};
            const sellerDetails = {
              phone: vendorProfile.phone || "",
              whatsapp: vendorProfile.whatsapp || "",
              address: vendorProfile.address || ""
            };
            return {
              buyer_id: user.id,
              vendor_id: item.vendor_id,
              product: { ...item, sellerDetails },
              status: 'pending'
            };
          });
          
          await supabase.from('orders').insert(supabaseOrders);
        } catch (err) {
          // console.warn("Failed to push orders to supabase", err);
        }
      }
      
      selectedCartItems.forEach(item => removeFromCart(item.id));
      setLocation("/orders");
    }
  };


  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-card border border-border/50 p-4 rounded-2xl items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                />
                <div className="h-24 w-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  <OptimizedImage src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Vendor: {item.vendor_id.substring(0, 8)}...</p>
                    </div>
                    <p className="font-semibold">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">{item.condition}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 p-2 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/50 p-6 rounded-2xl h-fit">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campus Fee</span>
                <span className="font-medium">₦1,000</span>
              </div>
              <div className="pt-3 border-t border-border/50 flex justify-between">
                <span className="font-semibold text-base">Total</span>
                <span className="font-bold text-lg">₦{(subtotal + 1000).toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsCheckoutModalOpen(true)}
              disabled={selectedCartItems.length === 0}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/" className="inline-flex bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-medium transition-colors">
            Start Shopping
          </Link>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <div className="flex items-center gap-2 text-primary">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-xl font-bold text-foreground">Transaction Notice</h2>
              </div>
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">
                You are about to initiate a 1-on-1 transaction with the seller(s). Once you proceed, the items will be marked as <strong>Pending</strong> in the marketplace.
              </p>
              
              <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl text-sm">
                <strong>Important:</strong> You must return to this site to confirm if the transaction was successful or to abort it. If no action is taken within <strong>1 week</strong>, the pending status will automatically expire and the item will be removed from the site.
              </div>

              <div className="pt-4 pb-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 flex-shrink-0 w-4 h-4 rounded border-border focus:ring-primary text-primary"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                    I agree to contact the seller and report back to CampusMarket to either confirm or abort this transaction.
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 pt-2 flex justify-end gap-3 border-t border-border/50 bg-muted/20">
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCheckout}
                disabled={!agreedToTerms}
                className="px-6 py-2 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
