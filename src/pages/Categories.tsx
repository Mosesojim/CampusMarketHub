import { CATEGORIES } from "../lib/constants";
import { Link } from "wouter";
import { motion } from "framer-motion";

const CATEGORY_IMAGES: Record<string, string> = {
  "Textbooks": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  "Supplies": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80",
  "Dorm": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
  "Services": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80"
};

import { useEffect, useState } from "react";
import { OptimizedImage } from "../components/OptimizedImage";

export default function Categories() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  useEffect(() => {
    const savedCats = JSON.parse(localStorage.getItem('campusmarket_custom_cats') || '[]');
    setCustomCategories(savedCats);
  }, []);
  return (
    <div className="container py-16 mx-auto max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Browse Categories</h1>
        <p className="text-muted-foreground mb-12 max-w-2xl text-lg">
          Explore our wide range of products organized by category. Find exactly what you need from trusted student vendors.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...CATEGORIES.filter(c => c !== "All"), ...customCategories].map((category, index) => (
          <Link href={`/products?category=${encodeURIComponent(category)}`} key={category}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-3xl overflow-hidden bg-card border border-border/50 hover:shadow-xl transition-all cursor-pointer h-[250px]"
            >
              <div className="absolute inset-0 z-0">
                <OptimizedImage 
                  src={CATEGORY_IMAGES[category] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"} 
                  alt={category} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 text-white">
                <h2 className="text-3xl font-bold mb-2 tracking-tight group-hover:scale-105 transition-transform">{category}</h2>
                <p className="text-sm text-white/80 max-w-[80%] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  Discover {category.toLowerCase()} items.
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
