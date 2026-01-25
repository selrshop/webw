import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/utils/api';

const BusinessSetup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subdomain: '',
    whatsapp_number: '',
    category: '',
    address: '',
    business_hours: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/businesses', formData);
      toast.success('Business created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const generateSubdomain = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <span className="text-lg font-heading font-bold text-primary">WAConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Create Your Business</h1>
          <p className="text-muted-foreground">Fill in the details to set up your WhatsApp-enabled website</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border/50 p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                data-testid="business-name-input"
                placeholder="e.g., Sharma Sweets"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData, 
                    name,
                    subdomain: formData.subdomain || generateSubdomain(name)
                  });
                }}
                required
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                data-testid="business-description-input"
                placeholder="Brief description of your business"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                data-testid="business-category-input"
                placeholder="e.g., Restaurant, Salon, Retail"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                data-testid="business-whatsapp-input"
                placeholder="919876543210 (with country code)"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                required
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., 91 for India)</p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="subdomain">Your Website URL *</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="subdomain"
                  data-testid="business-subdomain-input"
                  placeholder="your-business-name"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
                  required
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">.waconnect.site</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                data-testid="business-address-input"
                placeholder="Business address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="hours">Business Hours (Optional)</Label>
              <Input
                id="hours"
                data-testid="business-hours-input"
                placeholder="e.g., Mon-Sat: 9 AM - 9 PM"
                value={formData.business_hours}
                onChange={(e) => setFormData({...formData, business_hours: e.target.value})}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
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
              data-testid="create-business-btn"
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Business'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessSetup;