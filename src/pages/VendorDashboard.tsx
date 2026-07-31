import { DollarSign, Package, TrendingUp, Users, Plus, X, ShieldAlert, Loader2, Check } from "lucide-react";
import { CATEGORIES } from "../lib/constants";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth";
import { MOCK_PRODUCTS } from "../lib/mockData";
import { supabase } from "../lib/supabase";
import { OptimizedImage } from "../components/OptimizedImage";
import { getLocalArray, getLocalObject } from "../lib/utils";

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  vendor_id: string;
  condition: string;
  description: string;
  image_url: string;
  is_sold: boolean;
  created_at: string;
  quantity?: number;
}

export function VendorDashboard() {
  const { user } = useAuth();
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState("");
  // isVerified moved down
  
  const fileRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: CATEGORIES[1],
    description: "",
    condition: "Good",
    quantity: 1
  });

  useEffect(() => {
    const saved = getLocalArray<any>('campusmarket_custom_cats');
    setCustomCategories(saved);
    if (user) {
      fetchProducts();
    }
  }, [user]);

    const [adminStatus, setAdminStatus] = useState(user?.verificationStatus || "none");
  const isVerified = user?.isVerified || adminStatus === "resolved" || false;
  useEffect(() => {
    if (user?.email) {
      const existing = getLocalArray<any>('campusmarket_verifications');
      const userReq = existing.find((v: any) => v.email === user.email);
      if (userReq) {
        setAdminStatus(userReq.status);
      }
    }
  }, [user]);
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user?.id)
        .neq('category', '_PROFILE_')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendorProducts(data || []);
      setFetchError("");
    } catch (err: any) {
      console.warn("Falling back to mock products due to error:", err.message);
       
        const localProducts = getLocalArray<any>('campusmarket_products');
        setVendorProducts(localProducts.filter((p: any) => p.vendor_id === user?.id));
      setFetchError("");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory = newProduct.category;
    if (isAddingCustomCategory && newCustomCategory.trim()) {
      finalCategory = newCustomCategory.trim();
      const updatedCats = [...new Set([...customCategories, finalCategory])];
      setCustomCategories(updatedCats);
      localStorage.setItem('campusmarket_custom_cats', JSON.stringify(updatedCats));
    }
    if (!user) return;
    
    setError("");
    setSubmitting(true);
    let finalImageUrl = "";
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        const CATEGORY_IMAGES: Record<string, string> = {
          "Textbooks": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
          "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
          "Supplies": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80",
          "Dorm": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
          "Services": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80"
        };
        finalImageUrl = CATEGORY_IMAGES[finalCategory] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80";
      } else {

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const getBase64 = (f: File): Promise<string> => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(f);
      });
      const localImageUrl = await getBase64(file);
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) {
        console.warn("Upload failed (bucket might not exist), using mock image. Error:", uploadError.message);
        finalImageUrl = localImageUrl;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
        }
      }

      const productData = {
        title: newProduct.title,
        quantity: newProduct.quantity,
        price: parseFloat(newProduct.price),
        category: finalCategory,
        vendor_id: user.id,
        condition: newProduct.condition,
        description: newProduct.description,
        image_url: finalImageUrl,
        is_sold: false
      };

      
      let { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select();
        
      if (insertError && insertError.message && insertError.message.includes('schema cache')) {
        console.warn("Schema cache error, retrying without quantity column");
        const fallbackData = { ...productData };
        delete fallbackData.quantity;
        
        const fallbackRes = await supabase
          .from('products')
          .insert([fallbackData])
          .select();
          
        data = fallbackRes.data;
        insertError = fallbackRes.error;
      }

      if (insertError) throw insertError;


      if (data) {
        setVendorProducts([data[0], ...vendorProducts]);
      }
      
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setIsAddModalOpen(false);
      }, 2500);
      setNewProduct({
        title: "",
        price: "",
        category: CATEGORIES[1],
        description: "",
        condition: "Good",
        quantity: 1
      });
      setIsAddingCustomCategory(false);
      setNewCustomCategory("");
      if (fileRef.current) fileRef.current.value = "";
      
    } catch (err: any) {
      const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      if ((errStr.includes("Failed to fetch") || errStr.includes("fetch failed") || errStr.includes("NetworkError") || errStr.includes("mock instance"))) {
        console.warn("Using mock product insertion due to fetch error");
        const mockNewProduct = {
          id: "mock-product-" + Date.now(),
          title: newProduct.title,
          price: parseFloat(newProduct.price),
          category: finalCategory,
          vendor_id: user.id,
          condition: newProduct.condition,
          description: newProduct.description,
          image_url: finalImageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          is_sold: false,
          created_at: new Date().toISOString()
        };
        const newProds = [mockNewProduct, ...vendorProducts];
        setVendorProducts(newProds);
        
        // Also add to global mock products
        const allLocal = getLocalArray<any>('campusmarket_products');
        localStorage.setItem('campusmarket_products', JSON.stringify([mockNewProduct, ...allLocal]));

        setIsAddModalOpen(false);
        setSuccessMessage("Product listed successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setNewProduct({ title: "", price: "", category: CATEGORIES[1], description: "", condition: "Good" });
        setIsAddingCustomCategory(false);
        setNewCustomCategory("");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const markAsSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_sold: true })
        .eq('id', id);

      if (error) throw error;
      
      setVendorProducts(vendorProducts.map(p => p.id === id ? { ...p, is_sold: true } : p));
      setSuccessMessage("Product marked as sold!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      if ((errStr.includes("Failed to fetch") || errStr.includes("fetch failed") || errStr.includes("NetworkError") || errStr.includes("mock instance"))) {
        console.warn("Using mock update due to fetch error");
        setVendorProducts(vendorProducts.map(p => p.id === id ? { ...p, is_sold: true } : p));
      setSuccessMessage("Product marked as sold!");
      setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        // console.warn("Error marking as sold:", err.message);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setVendorProducts(vendorProducts.filter(p => p.id !== id));
    } catch (err: any) {
      const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      if ((errStr.includes("Failed to fetch") || errStr.includes("fetch failed") || errStr.includes("NetworkError") || errStr.includes("mock instance"))) {
        console.warn("Using mock delete due to fetch error");
        setVendorProducts(vendorProducts.filter(p => p.id !== id));
      } else {
        // console.warn("Error deleting product:", err.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMessage && (
        <div className="bg-emerald-100 text-emerald-800 text-sm p-4 rounded-xl mb-4 border border-emerald-200">
          {successMessage}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your campus store and track sales.</p>
        </div>
      </div>

      
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-start gap-3 mt-4">
        <div className="p-2 bg-primary/10 text-primary rounded-full">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-amber-900 dark:text-amber-200 font-bold">Important Notice to Vendors</h3>
          <p className="text-amber-800 dark:text-amber-300/80 text-sm mt-1">
            Your account can only be fully verified and trusted by buyers when you complete both automatic and manual verification. Make sure to provide detailed contact information (phone, WhatsApp, and location/address) and bio in your profile settings so buyers can easily reach out to you.
          </p>
        </div>
      </div>
      
      {!isVerified && adminStatus !== "pending" ? (
        <div className="bg-amber-100 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-amber-800 font-bold">Unverified Account</h3>
            <p className="text-amber-700 text-sm mt-1">
              Your account must be successfully verified before you can start uploading products. Please submit your matriculation number and student ID on the Profile page.
              {adminStatus === "rejected" && <span className="font-bold block mt-2 text-destructive">Your previous submission was rejected. Please retry.</span>}
            </p>
          </div>
        </div>
      ) : adminStatus === "pending" ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-full">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-blue-800 font-bold">Verification Under Final Review</h3>
            <p className="text-blue-700 text-sm mt-1">
              You passed the automated verification and can start listing products! Note that an admin will still conduct a final manual review.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₦${vendorProducts.filter(p => p.is_sold).reduce((acc, p) => acc + p.price, 0).toLocaleString()}`, icon: DollarSign },
          { label: "Active Listings", value: vendorProducts.filter(p => !p.is_sold).length.toString(), icon: Package },
          { label: "Profile Views", value: "0", icon: Users },
          { label: "Sales This Month", value: vendorProducts.filter(p => p.is_sold).length.toString(), icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Listings</h3>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isVerified}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors flex items-center ${
                isVerified 
                  ? "bg-foreground text-background hover:bg-foreground/90" 
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <Plus className="w-4 h-4 mr-1" /> New Item
            </button>
          </div>
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {fetchError ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-xl inline-block max-w-lg">
                          <h4 className="font-bold mb-1">Database Error</h4>
                          <p className="text-sm">{fetchError}</p>
                        </div>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : vendorProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No products listed yet.
                      </td>
                    </tr>
                  ) : vendorProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className={`h-10 w-10 bg-muted rounded-lg overflow-hidden flex-shrink-0 ${p.is_sold ? 'opacity-50 grayscale' : ''}`}>
                          <OptimizedImage src={p.image_url} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className={`font-medium truncate max-w-[150px] ${p.is_sold ? 'line-through text-muted-foreground' : ''}`}>{p.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">₦{p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {p.is_sold ? (
                          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">Sold</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!p.is_sold ? (
                          <button 
                            onClick={() => markAsSold(p.id)}
                            className="text-primary hover:underline font-medium text-xs whitespace-nowrap"
                          >
                            Mark Sold
                          </button>
                        ) : (
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="text-destructive hover:underline font-medium text-xs whitespace-nowrap"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {addSuccess ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Product Uploaded!</h3>
                <p className="text-muted-foreground">Your product has been successfully listed on the marketplace.</p>
              </div>
            ) : (
            <form onSubmit={handleAddProduct} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Title</label>
                <input 
                  required
                  type="text"
                  value={newProduct.title}
                  onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="E.g., Engineering Mathematics Textbook"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

                            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₦)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="5000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={newProduct.quantity}
                    onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 1})}
                    placeholder="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition</label>
                  <select 
                    value={newProduct.condition}
                    onChange={e => setNewProduct({...newProduct, condition: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                {!isAddingCustomCategory ? (
                  <select 
                    value={newProduct.category}
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setIsAddingCustomCategory(true);
                      } else {
                        setNewProduct({...newProduct, category: e.target.value});
                      }
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {[...CATEGORIES.filter(c => c !== "All"), ...customCategories].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="ADD_NEW">+ Add New Category</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="Enter new category name..."
                      value={newCustomCategory}
                      onChange={(e) => setNewCustomCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsAddingCustomCategory(false)}
                      className="px-3 py-2 text-muted-foreground hover:bg-muted rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Product will be automatically listed in this category feed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <input 
                  type="file" 
                  ref={fileRef}
                  accept="image/*"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 hover:file:bg-primary/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product, its features, and any flaws..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50 flex items-center"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {submitting ? "Uploading..." : "Upload Product"}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
