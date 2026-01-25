import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Store, MessageCircle, Package, Calendar, ShoppingCart, Settings, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';
import { getUser, logout } from '@/utils/auth';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on role
    if (user?.role === 'super_admin') {
      navigate('/admin');
      return;
    }
    if (user?.role === 'reseller') {
      navigate('/reseller');
      return;
    }
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchAnalytics(selectedBusiness.id);
    }
  }, [selectedBusiness]);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data);
      if (response.data.length > 0) {
        setSelectedBusiness(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (businessId) => {
    try {
      const response = await api.get(`/businesses/${businessId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <Store className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-2">No Business Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first business to get started</p>
          <Link to="/business/setup">
            <Button data-testid="create-first-business-btn" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6">
              <Plus className="mr-2 w-5 h-5" />
              Create Your Business
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                <span className="text-xl font-heading font-bold text-primary">WAConnect</span>
              </Link>
              <div className="hidden md:block h-6 w-px bg-border"></div>
              <select
                data-testid="business-selector"
                value={selectedBusiness?.id || ''}
                onChange={(e) => {
                  const biz = businesses.find(b => b.id === e.target.value);
                  setSelectedBusiness(biz);
                }}
                className="hidden md:block bg-transparent font-medium text-lg focus:outline-none cursor-pointer"
              >
                {businesses.map(biz => (
                  <option key={biz.id} value={biz.id}>{biz.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-muted-foreground mr-2">Hi, {user?.name}</span>
              <Button
                data-testid="logout-btn"
                variant="ghost"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-primary" />
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {analytics?.products_count || 0}
            </div>
            <div className="text-sm text-muted-foreground">Products</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-1">
              {analytics?.pending_bookings || 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending Bookings</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-1">
              {analytics?.pending_orders || 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending Orders</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              ₹{analytics?.total_revenue?.toFixed(0) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Quick Actions */}
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl font-heading font-semibold mb-4">Quick Actions</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link to={`/business/${selectedBusiness.id}/products`}>
                <div data-testid="nav-products" className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
                  <Package className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-heading font-medium mb-1">Manage Products</h3>
                  <p className="text-sm text-muted-foreground">Add, edit or remove products & services</p>
                </div>
              </Link>

              <Link to={`/business/${selectedBusiness.id}/bookings`}>
                <div data-testid="nav-bookings" className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
                  <Calendar className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-heading font-medium mb-1">View Bookings</h3>
                  <p className="text-sm text-muted-foreground">Manage customer bookings & appointments</p>
                </div>
              </Link>

              <Link to={`/business/${selectedBusiness.id}/orders`}>
                <div data-testid="nav-orders" className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
                  <ShoppingCart className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-heading font-medium mb-1">View Orders</h3>
                  <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
                </div>
              </Link>

              <Link to={`/business/${selectedBusiness.id}/settings`}>
                <div data-testid="nav-settings" className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
                  <Settings className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-heading font-medium mb-1">Business Settings</h3>
                  <p className="text-sm text-muted-foreground">Update business info & WhatsApp settings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Business Info Card */}
          <div className="md:col-span-4">
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-heading font-medium mb-4">Your Business Website</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-sm opacity-80 mb-1">Your website URL:</p>
                <p className="font-mono text-sm break-all">
                  {window.location.origin}/site/{selectedBusiness.subdomain}
                </p>
              </div>
              <Link to={`/site/${selectedBusiness.subdomain}`} target="_blank">
                <Button data-testid="view-website-btn" variant="secondary" className="w-full rounded-full">
                  View Your Website
                </Button>
              </Link>
            </div>

            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="font-heading font-medium mb-3">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact our support team for any assistance
              </p>
              <Button variant="outline" className="w-full rounded-full" onClick={() => window.open('https://wa.me/919999999999', '_blank')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;