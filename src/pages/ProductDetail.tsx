import { Link, useParams } from "wouter";
import { ArrowLeft, ShoppingCart, User, MessageCircle, Star, Loader2, X, MapPin, Phone, ShieldAlert, Store, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { ProductService } from "../services/productService";
import { supabase } from "../lib/supabase";
import { Product } from "./VendorDashboard";
import { useCart } from "../lib/cart";
import { useAuth } from "../lib/auth";
import { OptimizedImage } from "../components/OptimizedImage";
import { getLocalArray, getLocalObject } from "../lib/utils";

export function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerDetails, setSellerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (!params?.id) return;
      
      try {
        const data = await ProductService.getProductById(params.id);
        if (!data) throw new Error('Product not found');
        setProduct(data);
        
                const profiles = getLocalObject<any>('campusmarket_vendor_profiles');
        let vendorProfile = profiles[data.vendor_id];
        
        
        
                try {
           const remoteProfile = await ProductService.getVendorProfile(data.vendor_id);
           if (remoteProfile) {
              vendorProfile = remoteProfile;
              // Also cache it locally to avoid future misses
              profiles[data.vendor_id] = remoteProfile;
              localStorage.setItem('campusmarket_vendor_profiles', JSON.stringify(profiles));
           }
        } catch(error) {
           console.warn("Failed to fetch vendor profile:", error);
        }
            
        if (vendorProfile) {
          setSellerDetails({
            name: vendorProfile.name,
            phone: vendorProfile.phone,
            whatsapp: vendorProfile.whatsapp,
            address: vendorProfile.address,
            bio: vendorProfile.bio,
            avatarUrl: vendorProfile.avatarUrl,
            isVerified: vendorProfile.isVerified
          });
        } else {
          setSellerDetails({
            name: "Seller information unavailable",
            phone: "",
            whatsapp: "",
            address: "",
            bio: "",
            avatarUrl: "",
            isVerified: false
          });
        }
      
        try {
          const allProducts = await ProductService.getAvailableProducts();
          const similar = allProducts.filter(p => p.id !== data.id && p.category === data.category).slice(0, 5);
          if (similar.length < 5) {
             const others = allProducts.filter(p => p.id !== data.id && p.category !== data.category).slice(0, 5 - similar.length);
             similar.push(...others);
          }
          setSimilarProducts(similar);
        } catch (e) {
          console.warn("Failed to fetch similar products", e);
        }

      } catch (err) {
        console.warn("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p className="font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold mb-2">Product not found</h3>
        <p className="text-muted-foreground mb-6">This product may have been removed or sold.</p>
        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => window.history.back()} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative aspect-square md:aspect-auto bg-muted">
            {product.image_url ? (
              <OptimizedImage 
                src={product.image_url} 
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-background/90 backdrop-blur-md text-sm font-semibold rounded-full shadow-sm">
                {product.condition}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 md:p-10 flex flex-col">
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-primary font-medium text-sm tracking-wide uppercase">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              {product.title}
            </h1>
            
            <div className="text-4xl font-bold text-foreground mb-8">
              ₦{product.price.toLocaleString()}
            </div>

            <div className="flex items-center justify-between py-4 border-y border-border/50 mb-8">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {sellerDetails.avatarUrl ? (
                    <OptimizedImage src={sellerDetails.avatarUrl} alt="Seller" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Sold by {sellerDetails.name || (user?.id === product.vendor_id ? user.name : "Seller")}</p>
                  <div className="flex items-center text-muted-foreground">
                    <Star className="h-3 w-3 text-muted-foreground/30" />
                    <Star className="h-3 w-3 text-muted-foreground/30" />
                    <Star className="h-3 w-3 text-muted-foreground/30" />
                    <Star className="h-3 w-3 text-muted-foreground/30" />
                    <Star className="h-3 w-3 text-muted-foreground/30" />
                    <span className="text-muted-foreground text-xs ml-1">(No reviews yet)</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsMessageModalOpen(true)} className="text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </button>
            </div>

            <div className="space-y-4 mb-auto">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
                 <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                   {product.quantity || 1} Available
                 </div>
            </div>
            
            <div className="pt-8 flex flex-col sm:flex-row gap-4 mt-2">
              <button onClick={handleAddToCart} className="flex-1 bg-foreground text-background hover:bg-foreground/90 py-4 rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      
      {similarProducts.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 bg-muted/30 p-2 sm:p-0 sm:bg-transparent rounded-2xl">
            {similarProducts.map((simProduct) => (
              <Link key={simProduct.id} href={`/products/${simProduct.id}`}>
                <div className="rounded-lg bg-card text-card-foreground overflow-hidden h-full flex flex-col group cursor-pointer shadow-sm sm:border sm:border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="aspect-[4/5] sm:aspect-square bg-muted relative overflow-hidden">
                    {simProduct.image_url ? (
                      <OptimizedImage src={simProduct.image_url} alt={simProduct.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        <Tag className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground/90">
                        {simProduct.title}
                      </h3>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-amber-600 mt-auto pt-1 sm:pt-2 flex items-center">
                      ₦{simProduct.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-2 pb-2 sm:px-4 sm:pb-3 sm:border-t sm:bg-muted/30 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[120px]">
                      <Store className="w-3 h-3" /> {(getLocalObject<any>('campusmarket_vendor_profiles')[simProduct.vendor_id]?.name) || "Seller"}
                    </span>
                    <span className="text-muted-foreground/70">{simProduct.condition}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      </div>
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Contact Seller</h2>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">About the Seller</h3>
                <p className="text-sm">{sellerDetails.bio}</p>
              </div>
              <div className="space-y-4">
                <a href={`https://wa.me/${(sellerDetails.whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted transition-colors">
                  <div className="bg-green-500/10 p-2 rounded-full text-green-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{sellerDetails.whatsapp}</p>
                  </div>
                </a>
                
                <a href={`tel:${(sellerDetails.phone || '').replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted transition-colors">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Phone Call</p>
                    <p className="text-sm text-muted-foreground">{sellerDetails.phone}</p>
                  </div>
                </a>
                
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="bg-muted p-2 rounded-full text-foreground">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Address / Location</p>
                    <p className="text-sm text-muted-foreground">{sellerDetails.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-500/10 text-amber-600 p-4 rounded-xl text-xs flex items-start gap-2 border border-amber-500/20">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Stay safe! Never pay in advance unless you have verified the item and seller in person.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

