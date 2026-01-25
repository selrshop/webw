import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

// Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import BusinessSetup from "@/pages/BusinessSetup";
import BusinessSettings from "@/pages/BusinessSettings";
import ProductsPageEnhanced from "@/pages/ProductsPageEnhanced";
import BookingsPage from "@/pages/BookingsPage";
import OrdersPage from "@/pages/OrdersPage";
import CustomerSite from "@/pages/CustomerSite";

// Utils
import { getToken } from "@/utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/business/setup" element={
            <ProtectedRoute>
              <BusinessSetup />
            </ProtectedRoute>
          } />
          <Route path="/business/:businessId/settings" element={
            <ProtectedRoute>
              <BusinessSettings />
            </ProtectedRoute>
          } />
          <Route path="/business/:businessId/products" element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/business/:businessId/bookings" element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          } />
          <Route path="/business/:businessId/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          
          {/* Public Customer Site */}
          <Route path="/site/:subdomain" element={<CustomerSite />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;