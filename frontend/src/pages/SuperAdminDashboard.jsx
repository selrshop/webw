import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Package, ShoppingCart, Calendar, TrendingUp, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/utils/api';
import { getUser, logout } from '@/utils/auth';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview');
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, businessesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/businesses')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBusinesses(businessesRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      toast.success('Role updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-heading font-bold">Super Admin Panel</h1>
                <p className="text-sm text-purple-100">WAConnect Platform Management</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button onClick={() => setView('overview')} className={`py-4 px-2 border-b-2 font-medium ${view === 'overview' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Overview
            </button>
            <button onClick={() => setView('users')} className={`py-4 px-2 border-b-2 font-medium ${view === 'users' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Users ({users.length})
            </button>
            <button onClick={() => setView('businesses')} className={`py-4 px-2 border-b-2 font-medium ${view === 'businesses' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Businesses ({businesses.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        {view === 'overview' && (
          <div>
            <h2 className="text-2xl font-heading font-bold mb-6">Platform Overview</h2>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats?.total_users || 0}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-10 h-10 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">{stats?.active_businesses || 0}</div>
                <div className="text-sm text-gray-600">Active Businesses</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-10 h-10 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats?.total_products || 0}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-10 h-10 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">₹{stats?.total_revenue?.toFixed(0) || 0}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                    <span>{stats?.total_orders || 0} Total Orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{stats?.total_bookings || 0} Total Bookings</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button onClick={() => setView('users')} variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" /> Manage Users
                  </Button>
                  <Button onClick={() => setView('businesses')} variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" /> Manage Businesses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {view === 'users' && (
          <div>
            <h2 className="text-2xl font-heading font-bold mb-6">All Users</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Created</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <Badge className={u.role === 'super_admin' ? 'bg-purple-600' : u.role === 'reseller' ? 'bg-blue-600' : 'bg-gray-600'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Select value={u.role} onValueChange={(role) => handleRoleChange(u.id, role)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business_owner">Business Owner</SelectItem>
                            <SelectItem value="reseller">Reseller</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Businesses */}
        {view === 'businesses' && (
          <div>
            <h2 className="text-2xl font-heading font-bold mb-6">All Businesses</h2>
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
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Subdomain: {biz.subdomain}</p>
                    <p>Created: {new Date(biz.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/site/${biz.subdomain}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full">
                      View Website
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;