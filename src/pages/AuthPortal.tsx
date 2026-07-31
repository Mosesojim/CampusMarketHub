import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export function AuthPortal() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [accountType, setAccountType] = useState("buyer");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              accountType,
              isVerified: false,
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          try {
            const { error: profileError } = await supabase.from("profiles").insert({
              id: data.user.id,
              full_name: name,
              matric_number: matricNumber || null,
              email: email
            });
            
            if (profileError) {
              console.error("Profile insert error:", profileError);
              throw new Error("Failed to create profile: " + profileError.message);
            }
            console.log("Successfully inserted profile for", email);
            

            if (accountType === "vendor") {
              const { error: vendorError } = await supabase.from("vendor_profiles").insert({
                user_id: data.user.id,
                name: name,
                created_at: new Date().toISOString()
              });
              
              if (vendorError) {
                console.error("Vendor insert error:", vendorError);
                // Don't fail the whole registration if vendor profile fails, but log it
              }
            }
          } catch(e) {
            console.error("Profile creation exception:", e);
            throw e;
          }
        }

        if (!data.session) {
          throw new Error("Registration succeeded but you are not logged in. Please disable 'Confirm email' in your Supabase dashboard (Authentication -> Providers -> Email) to allow instant login.");
        }
        
        if (accountType === "vendor") {
          setLocation("/vendor");
        } else {
          setLocation("/");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        
        const isAdmin = data.user.user_metadata?.accountType === "admin";
        const isVendor = data.user.user_metadata?.accountType === "vendor";
        
        if (isAdmin) {
          setLocation("/admin");
        } else if (isVendor) {
          setLocation("/vendor");
        } else {
          setLocation("/");
        }
      }
    } catch (err: any) {
      const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      let errorMsg = err?.message || errStr || "An error occurred during authentication.";
      
      if (errStr.includes("Failed to fetch") || errStr.includes("fetch failed") || errStr.includes("NetworkError")) {
        console.error("Supabase connection failed. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        setError("Network error: Could not connect to the database. Please ensure your Supabase URL and Key are correct in settings.");
        return;
      }
      
      if (errStr.includes("mock instance")) {
        setError("Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
        return;
      }
      console.error("Auth error:", err);
      
      if (errorMsg.toLowerCase().includes("user already registered") || errorMsg.toLowerCase().includes("already registered")) {
        errorMsg = "An account with this email already exists. Please login instead.";
      } else if (errorMsg.toLowerCase().includes("rate limit")) {
        errorMsg = "Too many attempts. Please try again later.";
      } else if (errorMsg.toLowerCase().includes("email logins are disabled")) {
        errorMsg = "Email logins are disabled in Supabase. Please go to Supabase Dashboard -> Authentication -> Providers -> Email, enable the Email provider, but keep 'Confirm email' disabled.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background text-foreground">
      <div className="absolute inset-0 z-0 bg-muted/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl mb-4">
              <Zap className="h-8 w-8 fill-current" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">CampusMarket</h1>
          </Link>
          <p className="text-muted-foreground mt-2">The student marketplace for everything.</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground border-border shadow-xl">
          <div dir="ltr" data-orientation="horizontal">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <div role="tablist" aria-orientation="horizontal" className="h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-2">
                <button 
                  type="button" 
                  role="tab" 
                  aria-selected={activeTab === "login"}
                  onClick={() => { setActiveTab("login"); setError(""); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-background text-foreground shadow' : 'hover:bg-background/50 text-muted-foreground'}`}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  role="tab" 
                  aria-selected={activeTab === "register"}
                  onClick={() => { setActiveTab("register"); setError(""); }}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-background text-foreground shadow' : 'hover:bg-background/50 text-muted-foreground'}`}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                {activeTab === "register" && (
                  <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex M."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Matriculation Number</label>
                    <input
                      type="text"
                      required
                      value={matricNumber}
                      onChange={e => setMatricNumber(e.target.value)}
                      placeholder="e.g. 19/SCI01/001"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Campus Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {activeTab === "register" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">I want to...</label>
                    <select 
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="buyer">Buy items</option>
                      <option value="vendor">Sell items (Vendor)</option>
                    </select>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                >
                  {loading ? "Please wait..." : activeTab === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
