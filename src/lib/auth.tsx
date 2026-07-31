import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isMock } from "./supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  accountType: "buyer" | "vendor" | "admin";
  isVerified: boolean;
  matricNumber?: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(user: SupabaseUser): User {
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || "User",
    accountType: user.user_metadata?.accountType || "buyer",
    isVerified: user.user_metadata?.isVerified || false,
    matricNumber: user.user_metadata?.matricNumber,
    verificationStatus: user.user_metadata?.verificationStatus || "none",
    avatarUrl: user.user_metadata?.avatarUrl,
    phone: user.user_metadata?.phone,
    whatsapp: user.user_metadata?.whatsapp,
    bio: user.user_metadata?.bio,
    address: user.user_metadata?.address,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (isMock) {
          throw new Error("Mock mode enabled, skipping real session fetch");
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          setToken(session.access_token);
          setUser(mapSupabaseUser(session.user));
        }
      } catch (err) {
        const mockUser = localStorage.getItem("mock_user");
        if (mockUser) {
          setUser(JSON.parse(mockUser));
          setToken("mock_token");
        } else {
          // If no mock user but we still want to clear session
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen for auth changes
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setToken(session.access_token);
          setUser(mapSupabaseUser(session.user));
        } else {
          // If no session from Supabase, don't clear mock session if it's there
          // Wait, if we logout from mock, we call logout() directly which clears state.
        }
      });
      subscription = data.subscription;
    } catch (err) {
      console.warn("Could not subscribe to auth state changes:", err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

    useEffect(() => {
    if (user) {
      if (user.accountType === "vendor" || user.accountType === "buyer") {
        const profiles = JSON.parse(localStorage.getItem('campusmarket_vendor_profiles') || '{}');
        profiles[user.id] = {
          name: user.name,
          phone: user.phone,
          whatsapp: user.whatsapp,
          bio: user.bio,
          address: user.address,
          isVerified: user.isVerified,
          avatarUrl: user.avatarUrl
        };
        localStorage.setItem('campusmarket_vendor_profiles', JSON.stringify(profiles));
      }
    }
  }, [user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("mock_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase sign out failed:", err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("mock_user");
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("mock_user", JSON.stringify(updatedUser));
    
    // Update local cache of vendor profiles so buyers can see it
    if (updatedUser.accountType === "vendor" || updatedUser.accountType === "buyer") {
      const profiles = JSON.parse(localStorage.getItem('campusmarket_vendor_profiles') || '{}');
      profiles[updatedUser.id] = {
        name: updatedUser.name,
        phone: updatedUser.phone,
        whatsapp: updatedUser.whatsapp,
        bio: updatedUser.bio,
        address: updatedUser.address,
        isVerified: updatedUser.isVerified,
        avatarUrl: updatedUser.avatarUrl
      };
      localStorage.setItem('campusmarket_vendor_profiles', JSON.stringify(profiles));
    }
    
    // Persist to Supabase metadata if available
    try {
      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          accountType: updatedUser.accountType,
          isVerified: updatedUser.isVerified,
          matricNumber: updatedUser.matricNumber,
          verificationStatus: updatedUser.verificationStatus,
          phone: updatedUser.phone,
          whatsapp: updatedUser.whatsapp,
          bio: updatedUser.bio,
          address: updatedUser.address,
          avatarUrl: updatedUser.avatarUrl,
        }
      });
    } catch (err) {
      console.warn("Supabase update user failed:", err);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
