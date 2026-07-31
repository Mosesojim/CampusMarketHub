import { Package, CheckCircle2, XCircle, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { OptimizedImage } from "../components/OptimizedImage";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Need to parse if it exists, or just use what we have
            const formatted = data.map((d: any) => ({
              id: d.id,
              product: d.product,
              status: d.status,
              time: new Date(d.created_at).toLocaleDateString(),
              sellerDetails: d.product?.sellerDetails || {}
            }));
            setOrders(formatted);
            localStorage.setItem('campusmarket_orders', JSON.stringify(formatted));
          } else {
             const loaded = JSON.parse(localStorage.getItem('campusmarket_orders') || '[]');
             setOrders(loaded);
          }
        } catch (err) {
          // console.warn("Failed to fetch orders from Supabase", err);
          const loaded = JSON.parse(localStorage.getItem('campusmarket_orders') || '[]');
          setOrders(loaded);
        }
      } else {
        const loaded = JSON.parse(localStorage.getItem('campusmarket_orders') || '[]');
        setOrders(loaded);
      }
    };
    fetchOrders();
  }, [user]);

  const handleComplete = async (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'completed' } : o);
    setOrders(updated);
    localStorage.setItem('campusmarket_orders', JSON.stringify(updated));
    
    if (user && !id.startsWith('ord-')) {
      try {
        await supabase.from('orders').update({ status: 'completed' }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
  };
  
  const handleCancel = async (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o);
    setOrders(updated);
    localStorage.setItem('campusmarket_orders', JSON.stringify(updated));
    
    if (user && !id.startsWith('ord-')) {
      try {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
  };
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders & Transactions</h1>
        <p className="text-muted-foreground mt-1">Manage your active meetups and confirm successful purchases.</p>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">No orders yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md">When you initiate a purchase, your orders will appear here for you to manage.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="h-32 w-32 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  <OptimizedImage src={order.product.image_url} alt={order.product.title} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {order.time}</span>
                      </div>
                      <h3 className="text-lg font-bold">{order.product.title}</h3>
                      <p className="text-xl font-bold mt-1">₦{order.product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50 grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Seller Contact</h4>
                      <p className="text-sm text-muted-foreground">{order.sellerDetails.phone}</p>
                      <a href={`https://wa.me/${order.sellerDetails.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {order.sellerDetails.address}
                      </p>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex flex-col gap-2 justify-end">
                        <p className="text-xs text-muted-foreground text-right mb-1">Have you met the seller?</p>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleComplete(order.id)} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Successful
                          </button>
                          <button onClick={() => handleCancel(order.id)} className="flex items-center gap-1 bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                            <XCircle className="w-4 h-4" /> Abort
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
