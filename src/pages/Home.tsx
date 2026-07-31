import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Store, ShieldCheck, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { ReviewsCarousel } from "../components/ReviewsCarousel";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Star, X } from "lucide-react";
import { OptimizedImage } from "../components/OptimizedImage";
import { refreshDashboardStats } from "../lib/stats";

export function Home() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ products: 0, users: 0, sales: 0 });

      React.useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          { count: productsCount, error: productsError },
          { count: usersCount, error: usersError },
          { count: salesCount, error: salesError },
        ] = await Promise.all([
          supabase
            .from("products")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("status", "completed"),
        ]);

        if (productsError) throw productsError;
        if (usersError) throw usersError;
        if (salesError) throw salesError;

        setStats({
          products: productsCount ?? 0,
          users: usersCount ?? 0,
          sales: salesCount ?? 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);

        // Only show zero if the database query fails
        setStats({
          products: 0,
          users: 0,
          sales: 0,
        });
      }
    };

    loadStats();

    // Subscribe to realtime changes to automatically refresh stats
    const productsSub = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadStats();
      })
      .subscribe();

    const profilesSub = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadStats();
      })
      .subscribe();

    const ordersSub = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsSub);
      supabase.removeChannel(profilesSub);
      supabase.removeChannel(ordersSub);
    };
  }, []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newReview = {
      id: Date.now().toString(),
      user: user.name || user.email,
      course: user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1),
      comment: reviewComment,
      rating: reviewRating,
      status: "pending",
      time: new Date().toLocaleDateString()
    };
    
    const existing = JSON.parse(localStorage.getItem("campusmarket_reviews") || "[]");
    localStorage.setItem("campusmarket_reviews", JSON.stringify([newReview, ...existing]));
    
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsReviewModalOpen(false);
      setReviewComment("");
      setReviewRating(5);
        }, 2000);
  };
  const [, setLocation] = useLocation();

  const handleStartSelling = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return setLocation("/auth");
    if (!user.isVerified) return setLocation("/profile");
    setLocation("/vendor");
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 rounded-[2rem] p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12 min-h-[70vh]">
        <div className="flex-1 space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
              Welcome to CampusMarket
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Buy & Sell <br />
              <span className="text-primary">On Campus</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mt-6">
              The premier marketplace exclusively for students. Find what you need, sell what you don't, and connect safely on campus.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 hover:scale-105 transition-all"
            >
              Browse Products
            </Link>
            <button
              onClick={handleStartSelling}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-background px-8 text-base font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted hover:scale-105 transition-all"
            >
              Start Selling
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/50"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl shadow-sm border border-border/50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-sm text-foreground">Verified Students</p>
                <p className="text-xs text-muted-foreground">Safe & Secure Trading</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl shadow-sm border border-border/50">
              <Store className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm text-foreground">Campus Vendors</p>
                <p className="text-xs text-muted-foreground">Trusted student sellers</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 pt-4"
          >
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.products}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.users}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Students Joined</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.sales}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Successful Sales</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full"
        >
          <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[400px] md:h-[500px]">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="col-span-7 row-span-2 relative rounded-3xl overflow-hidden shadow-lg border border-border group"
            >
              <OptimizedImage                 src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                alt="Student vendor clothing rack"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="col-span-5 row-span-1 relative rounded-3xl overflow-hidden shadow-lg border border-border group"
            >
              <OptimizedImage                 src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
                alt="Student handing over purchased item"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="col-span-5 row-span-1 relative rounded-3xl overflow-hidden shadow-lg border border-border group"
            >
              <OptimizedImage                 src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80"
                alt="Stack of used textbooks for sale"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-32 w-[100vw] left-1/2 -translate-x-1/2">
        {/* Full-bleed Blurred Background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <OptimizedImage             src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1600&q=80"
            alt="Campus Vendor Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: 'blur(16px)' }}
          />
          <div className="absolute inset-0 bg-background/80 dark:bg-background/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border aspect-[4/5] md:aspect-auto md:h-[650px] group"
            >
              <OptimizedImage                 src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80"
                alt="Students trading items on campus"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">100% Secure</p>
                  <p className="text-sm text-gray-600">Campus verified users only</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-10">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">Everything you need</h2>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed">Built exclusively for our university ecosystem, giving you the best tools to buy and sell safely.</p>
            </div>
            
            <div className="space-y-8">
              {[
                {
                  title: "Buy Products Easily",
                  desc: "Find everything from textbooks to electronics, all sold by your peers right here on campus.",
                  icon: ShoppingBag,
                },
                {
                  title: "Sell Your Items",
                  desc: "Create a vendor profile, list your items in minutes, and reach thousands of students instantly.",
                  icon: Store,
                },
                {
                  title: "Student Verification",
                  desc: "We verify every vendor using matriculation numbers and IDs to ensure a secure environment.",
                  icon: ShieldCheck,
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Reviews Section */}
      <section className="py-12 bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="flex flex-col md:flex-row gap-8 items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Student Reviews</h2>
            <p className="text-muted-foreground mt-2">See what others are saying about CampusMarket.</p>
          </div>
          {user ? (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Leave a Review
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-primary font-medium hover:underline"
            >
              Join them today &rarr;
            </Link>
          )}
        </div>
        <ReviewsCarousel />
      </section>
      
    
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Leave a Review</h2>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thank you!</h3>
                <p className="text-muted-foreground">Your review has been submitted and is awaiting approval by an admin.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Reviewing as</label>
                  <input 
                    type="text" 
                    value={user?.name || user?.email || ""} 
                    disabled 
                    className="flex h-12 w-full rounded-xl border border-input bg-muted/50 px-4 py-2 text-sm opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your account info will be used automatically.</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-2 rounded-full transition-colors ${reviewRating >= star ? 'text-amber-500' : 'text-muted-foreground opacity-30 hover:opacity-100'}`}
                      >
                        <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Comment</label>
                  <textarea 
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-xl transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
