import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import api from '@/utils/api';

const BusinessSettings = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/${businessId}`);
      setBusiness(response.data);
    } catch (error) {
      toast.error('Failed to load business');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.put(`/businesses/${businessId}`, {
        name: business.name,
        description: business.description,
        whatsapp_number: business.whatsapp_number,
        category: business.category,
        logo_url: business.logo_url,
        cover_image_url: business.cover_image_url,
        address: business.address,
        business_hours: business.business_hours,
        whatsapp_api_enabled: business.whatsapp_api_enabled,
        whatsapp_api_key: business.whatsapp_api_key
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Business Settings</h1>
          <p className="text-muted-foreground">Manage your business information and WhatsApp settings</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  data-testid="settings-name-input"
                  value={business.name}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="settings-description-input"
                  value={business.description}
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={business.category}
                    onChange={(e) => setBusiness({...business, category: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    data-testid="settings-whatsapp-input"
                    value={business.whatsapp_number}
                    onChange={(e) => setBusiness({...business, whatsapp_number: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={business.address || ''}
                  onChange={(e) => setBusiness({...business, address: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="hours">Business Hours</Label>
                <Input
                  id="hours"
                  value={business.business_hours || ''}
                  onChange={(e) => setBusiness({...business, business_hours: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">Images</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  data-testid="settings-logo-input"
                  placeholder="https://example.com/logo.png"
                  value={business.logo_url || ''}
                  onChange={(e) => setBusiness({...business, logo_url: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  data-testid="settings-cover-input"
                  placeholder="https://example.com/cover.jpg"
                  value={business.cover_image_url || ''}
                  onChange={(e) => setBusiness({...business, cover_image_url: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp API */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">WhatsApp Integration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable WhatsApp Business API</Label>
                  <p className="text-sm text-muted-foreground mt-1">Upgrade to Pro plan for automated messages</p>
                </div>
                <Switch
                  data-testid="api-toggle"
                  checked={business.whatsapp_api_enabled}
                  onCheckedChange={(checked) => setBusiness({...business, whatsapp_api_enabled: checked})}
                />
              </div>
              {business.whatsapp_api_enabled && (
                <div>
                  <Label htmlFor="apiKey">WhatsApp API Key</Label>
                  <Input
                    id="apiKey"
                    data-testid="api-key-input"
                    type="password"
                    placeholder="Enter your WhatsApp API key"
                    value={business.whatsapp_api_key || ''}
                    onChange={(e) => setBusiness({...business, whatsapp_api_key: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="save-settings-btn"
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessSettings;