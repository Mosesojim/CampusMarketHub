import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { MainLayout } from "./components/MainLayout";
import { Marketplace } from "./pages/Marketplace";
import { AuthPortal } from "./pages/AuthPortal";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Orders } from "./pages/Orders";
import { VendorDashboard } from "./pages/VendorDashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { AdminLogin } from "./pages/AdminLogin";
import { Profile } from "./pages/Profile";
import { Home } from "./pages/Home";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Report from "./pages/Report";
import Faqs from "./pages/Faqs";
import Safety from "./pages/Safety";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CommunityRules from "./pages/CommunityRules";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

export default function App() {
  const [location] = useLocation();

  if (location.startsWith('/auth')) {
    return <AuthPortal />;
  }


  return (
    <ErrorBoundary>
      <MainLayout>
        <ScrollToTop />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Marketplace} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/categories" component={Categories} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/report" component={Report} />
          <Route path="/faqs" component={Faqs} />
          <Route path="/safety" component={Safety} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/community-rules" component={CommunityRules} />
          <Route path="/admin-login" component={AdminLogin} />
          
          <Route path="/cart">
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          </Route>
          
          <Route path="/orders">
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </Route>
          
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          
          <Route path="/vendor">
            <ProtectedRoute requireVendor>
              <VendorDashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/admin">
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          </Route>
          
          <Route>
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
              404 - Page Not Found
            </div>
          </Route>
        </Switch>
      </MainLayout>
    </ErrorBoundary>
  );
}
