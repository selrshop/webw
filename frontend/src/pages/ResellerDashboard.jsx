import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, TrendingUp, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';
import { getUser, logout } from '@/utils/auth';

const ResellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'reseller') {
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, businessesRes] = await Promise.all([
        api.get('/reseller/stats'),
        api.get('/reseller/businesses')
      ]);
      setStats(statsRes.data);
      setBusinesses(businessesRes.data);
    } catch (error) {
      toast.error('Failed to load reseller data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reseller panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-heading font-bold">Reseller Dashboard</h1>
                <p className="text-sm text-blue-100">Manage Your Client Businesses</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Hi, {user?.name}</span>
              <Button onClick={logout} variant="ghost" className="text-white hover:bg-white/20">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats?.total_businesses || 0}</div>
            <div className="text-sm text-gray-600">Total Businesses</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats?.active_businesses || 0}</div>
            <div className="text-sm text-gray-600">Active Businesses</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
            <Link to="/business/setup" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6">
                <Plus className="w-5 h-5 mr-2" /> Create New Business
              </Button>
            </Link>
          </div>
        </div>

        {/* Businesses */}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-6">Your Client Businesses</h2>
          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Businesses Yet</h3>
              <p className="text-gray-600 mb-6">Create your first client business to get started</p>
              <Link to="/business/setup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                  <Plus className="w-5 h-5 mr-2" /> Create Business
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(biz => (
                <div key={biz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{biz.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{biz.category}</p>
                      <Badge>{biz.template_type}</Badge>
                    </div>
                    <Badge className={biz.is_active ? 'bg-green-600' : 'bg-gray-400'}>
                      {biz.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Subdomain: {biz.subdomain}</p>
                    <p>Created: {new Date(biz.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/business/${biz.id}/settings`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Link to={`/site/${biz.subdomain}`} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Site
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellerDashboard;