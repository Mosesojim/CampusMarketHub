import React, { useState, useEffect } from "react";
import { Search, Flame, Tag, Store, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ProductService } from "../services/productService";
import { Product } from "./VendorDashboard";
import { CATEGORIES } from "../lib/constants";
import { MOCK_PRODUCTS } from "../lib/mockData";
import { OptimizedImage } from "../components/OptimizedImage";
import { getLocalArray, getLocalObject } from "../lib/utils";


export function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
        const [products, setProducts] = useState<Product[]>(ProductService.getCachedProducts() || []);
  const [loading, setLoading] = useState(!ProductService.getCachedProducts());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedCats = getLocalArray<any>('campusmarket_custom_cats');
    setCustomCategories(savedCats);
    
            const fetchProducts = async () => {
      try {
        const data = await ProductService.getAvailableProducts();
        setProducts(data || []);
      } catch (err: any) {
        console.warn("Marketplace error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || (product.category || "") === activeCategory;
    const searchString = `${product.title || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.7C85.9,-26.1,92.5,-11,90.4,2.9C88.4,16.8,77.6,29.4,66.7,40.1C55.8,50.7,44.9,59.3,32.2,66.3C19.5,73.4,5,78.9,-8.8,79.5C-22.6,80.1,-35.8,75.9,-48.4,68.8C-61,61.7,-73,51.8,-79.9,39.1C-86.8,26.4,-88.6,10.9,-86,-3.6C-83.3,-18.2,-76.2,-31.6,-66.3,-42.1C-56.4,-52.7,-43.7,-60.4,-30.9,-67.2C-18.1,-74,-5.2,-80,5.7,-82.4C16.6,-84.9,32.5,-83.5,45.7,-76.4Z" transform="translate(100 100)"></path>
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          {searchQuery !== "" ? (
            <div className="py-4 animate-in fade-in slide-in-from-bottom-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                {filteredProducts.length === 0 ? "Items not found" : "Search Results"}
              </h1>
              <p className="text-primary-foreground/80 text-lg sm:text-xl max-w-xl font-medium">
                {filteredProducts.length === 0 
                  ? `We couldn't find any items matching "${searchQuery}".`
                  : `Showing results for "${searchQuery}".`}
              </p>
            </div>
          ) : (
            <>
              <div className="whitespace-nowrap inline-flex items-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover-elevate border-transparent mb-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm py-1 px-3 border-0">
                <Flame className="w-4 h-4 mr-1" /> Trending on Campus
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">The Student Bazaar. <br />Buy, Sell, Trade.</h1>
              <p className="text-primary-foreground/80 text-lg sm:text-xl max-w-xl font-medium">Textbooks, electronics, dorm essentials and student services. Your campus marketplace.</p>
            </>
          )}
          <form onSubmit={handleSearch} className="relative mt-8 max-w-xl flex items-center bg-background rounded-xl p-1 shadow-xl focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-5 w-5 text-muted-foreground ml-3" />
            <input
              type="text"
              placeholder="Search textbooks, electronics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex h-12 w-full rounded-md bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground border border-primary-border h-9 px-4 py-2 hover:opacity-90">
              Search
            </button>
          </form>
        </div>
      </section>

      <div>
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-none items-center mb-6">
          {[...CATEGORIES, ...customCategories].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border h-9 px-4 py-2 rounded-full ${
                activeCategory === category
                  ? "bg-foreground text-background border-transparent"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-destructive/10 border border-destructive/20 rounded-3xl">
            <h3 className="text-xl font-bold text-destructive mb-2">Database Error</h3>
            <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="font-medium">Loading campus marketplace...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border/50 rounded-3xl">
            <Tag className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No products found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">We couldn't find any items matching your search or category. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 bg-muted/30 p-2 sm:p-0 sm:bg-transparent rounded-2xl">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="rounded-lg bg-card text-card-foreground overflow-hidden h-full flex flex-col group cursor-pointer shadow-sm sm:border sm:border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="aspect-[4/5] sm:aspect-square bg-muted relative overflow-hidden">
                    {product.image_url ? (
                      <OptimizedImage src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        <Tag className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground/90">
                        {product.title}
                      </h3>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-amber-600 mt-auto pt-1 sm:pt-2 flex items-center">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-2 pb-2 sm:px-4 sm:pb-3 sm:border-t sm:bg-muted/30 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1 font-medium truncate max-w-[120px]">
                      <Store className="w-3 h-3" /> {(getLocalObject<any>('campusmarket_vendor_profiles')[product.vendor_id]?.name) || "Seller"}
                    </span>
                    <span className="text-muted-foreground/70">{product.condition}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
