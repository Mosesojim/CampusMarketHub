import { supabase } from '../lib/supabase';
import { Product } from '../pages/VendorDashboard';
import { getLocalArray } from '../lib/utils';
import { MOCK_PRODUCTS } from '../lib/mockData';

let cachedProducts: Product[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const ProductService = {
  getCachedProducts: () => cachedProducts,
      
  getVendorProfile: async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', vendorId)
        .limit(1)
        .single();
        
      if (!error && data) {
        return {
          name: data.name,
          avatarUrl: data.avatar_url,
          phone: data.phone,
          whatsapp: data.whatsapp,
          address: data.address,
          bio: data.bio,
          isVerified: data.is_verified
        };
      }
    } catch(err) {
      console.warn("Failed to fetch vendor profile:", err);
    }
    return null;
  },
  
  getAvailableProducts: async (forceRefresh = false, page = 0, pageSize = 50) => {
    if (!forceRefresh && cachedProducts && (Date.now() - lastFetchTime < CACHE_TTL)) {
      return cachedProducts;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, category, image_url, condition, vendor_id, quantity, created_at, description, is_sold')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
          
      cachedProducts = data as Product[];
      lastFetchTime = Date.now();
      return data as Product[];
    } catch (err) {
      console.warn("ProductService falling back to mock data:", err);
      const localProducts = getLocalArray('campusmarket_products');
      const fallback = localProducts.length > 0 ? localProducts : [];
      cachedProducts = fallback as Product[];
      lastFetchTime = Date.now();
      return fallback as Product[];
    }
  },

  getProductsByVendor: async (vendorId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, price, category, image_url, condition, vendor_id, quantity, created_at, description, is_sold')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Product[];
  },

  getProductById: async (id: string) => {
    if (cachedProducts) {
      const found = cachedProducts.find(p => p.id === id);
      if (found) return found;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    } catch (err) {
      console.warn("ProductService falling back to mock data for byId:", err);
      const allLocal = getLocalArray<any>('campusmarket_products');
      const mockProduct = allLocal.find((p: any) => p.id === id) || MOCK_PRODUCTS.find(p => p.id === id);
      if (mockProduct) return mockProduct;
      throw err;
    }
  },

  createProduct: async (productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return data as Product[];
  },

  markAsSold: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({ is_sold: true })
      .eq('id', id);
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
   
  uploadProductImage: async (fileName: string, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and WebP images are allowed");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image must be smaller than 2MB");
    }
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
       
    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
         
    return publicUrlData.publicUrl;
  }
};
