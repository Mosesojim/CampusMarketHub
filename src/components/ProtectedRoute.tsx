import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireVendor }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Adding a tiny delay to allow auth state to settle before redirecting
    const timer = setTimeout(() => {
      if (!user) {
        setLocation("/auth");
      } else if (requireAdmin && user.accountType !== "admin") {
        setLocation("/"); // Redirect non-admins to home
      } else if (requireVendor && user.accountType !== "vendor") {
        setLocation("/");
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, requireAdmin, requireVendor, setLocation]);

  if (isChecking || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAdmin && user.accountType !== "admin") return null;
  if (requireVendor && user.accountType !== "vendor") return null;

  return <>{children}</>;
}
