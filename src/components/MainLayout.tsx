import React, { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Shield, Clock, Store, Sun, Moon, Menu, X, Facebook, Twitter, Instagram, HelpCircle } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { supabase } from "../lib/supabase";

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, login } = useAuth();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [subMessage, setSubMessage] = useState("");
  const [subStatus, setSubStatus] = useState<"success"|"error"|null>(null);
  
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  const [location, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location]);

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const getLinkClass = (path: string) => 
    `text-sm font-medium transition-colors ${location === path ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`;
    
  const getMobileLinkClass = (path: string) => 
    `text-sm font-medium py-2 transition-colors ${location === path ? 'text-primary font-bold' : 'hover:text-primary'}`;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simple mock logic for storing subscribers
    const subscribers = JSON.parse(localStorage.getItem('campusmarket_subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('campusmarket_subscribers', JSON.stringify(subscribers));
    }
    
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Store className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">CampusMarket Hub</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link href="/" className={getLinkClass('/')}>Home</Link>
              <Link href="/products" className={getLinkClass('/products')}>Products</Link>
              <Link href="/categories" className={getLinkClass('/categories')}>Categories</Link>
              <Link href="/about" className={getLinkClass('/about')}>About</Link>
              <Link href="/contact" className={getLinkClass('/contact')}>Contact</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <>
                <Link href="/vendor" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors hidden sm:flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  <span className="text-sm font-medium hidden lg:inline-block">Sell</span>
                </Link>
                <Link href="/orders" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors hidden sm:flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium hidden lg:inline-block">Orders</span>
                </Link>
              </>
            )}
            <Link href="/cart" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartItems.length}</span>}
            </Link>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors mr-2">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                {user?.accountType === "admin" ? (
                  <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Shield className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link href="/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground border border-primary-border min-h-9 px-4 py-2 hover:opacity-90 ml-2"
              >
                Sign In
              </Link>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 absolute top-16 left-0 w-full shadow-lg">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/')}>Home</Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/products')}>Products</Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/categories')}>Categories</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/about')}>About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/contact')}>Contact</Link>
            {!user && (
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 text-primary">Sign In</Link>
            )}
            {user && (
              <div className="flex gap-4 pt-2 border-t">
                 <Link href="/vendor" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium py-2 text-muted-foreground"><Store className="w-4 h-4"/>Sell</Link>
                 <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium py-2 text-muted-foreground"><Clock className="w-4 h-4"/>Orders</Link>
              </div>
            )}
          </div>
        )}
      </header>
      
      <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-muted/30 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Column 1 - Brand */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Store className="h-4 w-4 fill-current" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">CampusMarket</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The leading e-commerce portal for students to buy and sell safely on campus.
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-2">
                Office: Esut, Agbani Nkanu West Enugu State
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5"/></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5"/></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5"/></a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/vendor" className="hover:text-primary transition-colors">Sell on CampusMarket</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
                {user?.accountType === "admin" ? <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li> : <li><Link href="/profile" className="hover:text-primary transition-colors">Profile Settings</Link></li>}
              </ul>
            </div>

            {/* Column 3 - Support */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                <li><Link href="/report" className="hover:text-primary transition-colors">Report a Problem</Link></li>
                <li><Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
              </ul>
            </div>

            {/* Column 4 - Company */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/community-rules" className="hover:text-primary transition-colors">Community Rules</Link></li>
              </ul>
            </div>

            {/* Column 5 - Administration */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Administration</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/admin-login" className="hover:text-primary transition-colors flex items-center gap-2 text-left w-full"><HelpCircle className="w-4 h-4"/> Admin Portal</Link></li>
              </ul>
              <ul className="space-y-2 text-sm text-muted-foreground">
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-card border border-border shadow-sm">
                <p className="text-xs font-semibold text-foreground mb-2">Subscribe to our newsletter</p>
                {subMessage && (
                  <div className={`p-2 mb-3 text-xs rounded-md ${subStatus === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-destructive/15 text-destructive'}`}>
                    {subMessage}
                  </div>
                )}
                <form className="flex gap-2" onSubmit={handleSubscribe}>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email" 
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                  />
                  <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 whitespace-nowrap">
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CampusMarket Hub. All rights reserved.</p>
            <p>Made for Campus Students 🎓</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
