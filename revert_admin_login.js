import fs from 'fs';
const code = `import React, { useState } from "react";
import { useLocation } from "wouter";
import { ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let authData;
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = data;
      
      if (signInError) {
        if (signInError.message.includes("Invalid login credentials") && email === "admin@campus.edu" && password === "admin123") {
           // Auto-create in DB for the first time so it's visible in the database
           const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
             email,
             password,
             options: {
               data: {
                 name: "System Admin",
                 accountType: "admin",
                 isVerified: true,
                 verificationStatus: "approved"
               }
             }
           });
           if (signUpError) throw signUpError;
           
           if (!signUpData.session) {
             throw new Error("Admin account created, but please disable 'Confirm email' in Supabase to login immediately.");
           }
           authData = signUpData;
        } else {
           throw signInError;
        }
      }
      
      const isAdmin = authData.user?.user_metadata?.accountType === "admin" || email === "admin@campus.edu";
      
      if (isAdmin) {
        setLocation("/admin");
      } else {
        setError("Unauthorized: This account does not have admin privileges.");
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error("Admin Auth error:", err);
      const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      
      // Fallback for missing fetch (local mock)
      if (errStr.includes("Failed to fetch") || errStr.includes("fetch failed") || errStr.includes("NetworkError")) {
        if (email === "admin@campus.edu" && password === "admin123") {
            const mockUser = {
              id: "admin-1",
              email: "admin@campus.edu",
              name: "System Admin",
              accountType: "admin" as const,
              isVerified: true,
              verificationStatus: "approved" as const,
            };
            login("admin_token", mockUser);
            setLocation("/admin");
            return;
        }
      }
      
      setError(err.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Restricted access area.</p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@campus.edu"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 px-4 py-2 w-full mt-2"
            >
              {loading ? "Authenticating..." : "Access Console"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
\`;
fs.writeFileSync('src/pages/AdminLogin.tsx', code);
