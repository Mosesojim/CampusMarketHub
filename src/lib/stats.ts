import { supabase } from "./supabase";

export async function refreshDashboardStats(setStats: any) {
  const [
    { count: products },
    { count: users },
    { count: sales },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  setStats({
    products: products ?? 0,
    users: users ?? 0,
    sales: sales ?? 0,
  });
}
