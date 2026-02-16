import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Save, Palette, Truck, Receipt, MapPin, Navigation, Loader2, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/utils/api';

const COLOR_PRESETS = [
  { name: 'Blue (Default)', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Green', primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'Pink', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'Indigo', primary: '#4f46e5', secondary: '#6366f1', accent: '#818cf8' },
];

const PAYMENT_GATEWAYS = [
  { value: 'razorpay', label: 'Razorpay', description: 'Most popular in India', icon: '🇮🇳' },
  { value: 'stripe', label: 'Stripe', description: 'International + India', icon: '💳' },
  { value: 'payu', label: 'PayU', description: 'Indian payment gateway', icon: '🏦' },
  { value: 'phonepe', label: 'PhonePe', description: 'UPI-focused payments', icon: '📱' },
];

const BusinessSettings = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
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
        whatsapp_api_key: business.whatsapp_api_key,
        delivery_charges: parseFloat(business.delivery_charges) || 0,
        tax_percentage: parseFloat(business.tax_percentage) || 0,
        min_order_for_free_delivery: business.min_order_for_free_delivery ? parseFloat(business.min_order_for_free_delivery) : null,
        primary_color: business.primary_color,
        secondary_color: business.secondary_color,
        accent_color: business.accent_color,
        // Location-based delivery
        business_latitude: business.business_latitude ? parseFloat(business.business_latitude) : null,
        business_longitude: business.business_longitude ? parseFloat(business.business_longitude) : null,
        free_delivery_radius_km: parseFloat(business.free_delivery_radius_km) || 5.0,
        delivery_charge_beyond_radius: parseFloat(business.delivery_charge_beyond_radius) || 0,
        max_delivery_radius_km: business.max_delivery_radius_km ? parseFloat(business.max_delivery_radius_km) : null,
        // Payment Gateway
        payment_gateway: business.payment_gateway || null,
        razorpay_key_id: business.razorpay_key_id || null,
        razorpay_key_secret: business.razorpay_key_secret || null,
        stripe_publishable_key: business.stripe_publishable_key || null,
        stripe_secret_key: business.stripe_secret_key || null,
        payu_merchant_key: business.payu_merchant_key || null,
        payu_merchant_salt: business.payu_merchant_salt || null,
        phonepe_merchant_id: business.phonepe_merchant_id || null,
        phonepe_salt_key: business.phonepe_salt_key || null,
        phonepe_salt_index: business.phonepe_salt_index ? parseInt(business.phonepe_salt_index) : null
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBusiness({
          ...business,
          business_latitude: position.coords.latitude.toFixed(6),
          business_longitude: position.coords.longitude.toFixed(6)
        });
        toast.success('Location detected successfully!');
        setDetectingLocation(false);
      },
      (error) => {
        let message = 'Failed to detect location';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out.';
        }
        toast.error(message);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const openInGoogleMaps = () => {
    if (business.business_latitude && business.business_longitude) {
      window.open(
        `https://www.google.com/maps?q=${business.business_latitude},${business.business_longitude}`,
        '_blank'
      );
    }
  };

  const applyColorPreset = (preset) => {
    setBusiness({
      ...business,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    });
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

          {/* Delivery & Charges */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-semibold">Delivery & Charges</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryCharges">Delivery Charges (₹)</Label>
                  <Input
                    id="deliveryCharges"
                    data-testid="delivery-charges-input"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={business.delivery_charges || ''}
                    onChange={(e) => setBusiness({...business, delivery_charges: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Amount charged for delivery</p>
                </div>
                <div>
                  <Label htmlFor="freeDeliveryMin">Free Delivery Above (₹)</Label>
                  <Input
                    id="freeDeliveryMin"
                    data-testid="free-delivery-input"
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={business.min_order_for_free_delivery || ''}
                    onChange={(e) => setBusiness({...business, min_order_for_free_delivery: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum order for free delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location-Based Delivery */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-semibold">Location-Based Delivery</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set your business location to auto-calculate delivery charges based on customer distance
            </p>
            
            <div className="space-y-4">
              {/* Business Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Label className="text-sm font-medium mb-3 block">Business Location</Label>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      id="latitude"
                      data-testid="business-latitude-input"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 19.076090"
                      value={business.business_latitude || ''}
                      onChange={(e) => setBusiness({...business, business_latitude: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      id="longitude"
                      data-testid="business-longitude-input"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 72.877426"
                      value={business.business_longitude || ''}
                      onChange={(e) => setBusiness({...business, business_longitude: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-2"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {detectingLocation ? 'Detecting...' : 'Use Current Location'}
                  </Button>
                  {business.business_latitude && business.business_longitude && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openInGoogleMaps}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Map
                    </Button>
                  )}
                </div>
                {business.business_latitude && business.business_longitude && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Location set: {business.business_latitude}, {business.business_longitude}
                  </p>
                )}
              </div>

              {/* Delivery Radius Settings */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="freeRadius">Free Delivery Radius (km)</Label>
                  <Input
                    id="freeRadius"
                    data-testid="free-radius-input"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="5"
                    value={business.free_delivery_radius_km || ''}
                    onChange={(e) => setBusiness({...business, free_delivery_radius_km: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Free delivery within this radius</p>
                </div>
                <div>
                  <Label htmlFor="chargesBeyond">Charge Beyond Radius (₹)</Label>
                  <Input
                    id="chargesBeyond"
                    data-testid="charge-beyond-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50"
                    value={business.delivery_charge_beyond_radius || ''}
                    onChange={(e) => setBusiness({...business, delivery_charge_beyond_radius: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Delivery charge if beyond free radius</p>
                </div>
                <div>
                  <Label htmlFor="maxRadius">Max Delivery Distance (km)</Label>
                  <Input
                    id="maxRadius"
                    data-testid="max-radius-input"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Optional"
                    value={business.max_delivery_radius_km || ''}
                    onChange={(e) => setBusiness({...business, max_delivery_radius_km: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for unlimited</p>
                </div>
              </div>

              {/* Preview */}
              {business.business_latitude && business.business_longitude && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm font-medium text-blue-900 mb-2">Delivery Rules Preview</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Free delivery within <strong>{business.free_delivery_radius_km || 5} km</strong></li>
                    <li>• ₹{business.delivery_charge_beyond_radius || 0} charge beyond {business.free_delivery_radius_km || 5} km</li>
                    {business.max_delivery_radius_km && (
                      <li>• No delivery beyond <strong>{business.max_delivery_radius_km} km</strong></li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Taxes */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-semibold">Tax Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="max-w-xs">
                <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                <Input
                  id="taxPercentage"
                  data-testid="tax-percentage-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={business.tax_percentage || ''}
                  onChange={(e) => setBusiness({...business, tax_percentage: e.target.value})}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">GST or other applicable taxes</p>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-semibold">Website Color Scheme</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Choose a color theme for your customer-facing website</p>
            
            {/* Color Presets */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyColorPreset(preset)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                    business.primary_color === preset.primary ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-transparent'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)` }}
                  title={preset.name}
                />
              ))}
            </div>
            
            {/* Custom Colors */}
            <div className="space-y-4">
              <p className="text-sm font-medium">Custom Colors</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      id="primaryColor"
                      data-testid="primary-color-input"
                      value={business.primary_color || '#2563eb'}
                      onChange={(e) => setBusiness({...business, primary_color: e.target.value})}
                      className="w-12 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={business.primary_color || '#2563eb'}
                      onChange={(e) => setBusiness({...business, primary_color: e.target.value})}
                      placeholder="#2563eb"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      data-testid="secondary-color-input"
                      value={business.secondary_color || '#3b82f6'}
                      onChange={(e) => setBusiness({...business, secondary_color: e.target.value})}
                      className="w-12 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={business.secondary_color || '#3b82f6'}
                      onChange={(e) => setBusiness({...business, secondary_color: e.target.value})}
                      placeholder="#3b82f6"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      id="accentColor"
                      data-testid="accent-color-input"
                      value={business.accent_color || '#60a5fa'}
                      onChange={(e) => setBusiness({...business, accent_color: e.target.value})}
                      className="w-12 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={business.accent_color || '#60a5fa'}
                      onChange={(e) => setBusiness({...business, accent_color: e.target.value})}
                      placeholder="#60a5fa"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 flex-1 rounded" style={{ backgroundColor: business.primary_color || '#2563eb' }}></div>
                  <div className="h-8 flex-1 rounded" style={{ backgroundColor: business.secondary_color || '#3b82f6' }}></div>
                  <div className="h-8 flex-1 rounded" style={{ backgroundColor: business.accent_color || '#60a5fa' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-semibold">Payment Gateway</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure a payment gateway to accept online payments from customers
            </p>

            {/* Gateway Selection */}
            <div className="mb-6">
              <Label>Select Payment Gateway</Label>
              <Select 
                value={business.payment_gateway || 'none'} 
                onValueChange={(value) => setBusiness({...business, payment_gateway: value === 'none' ? null : value})}
              >
                <SelectTrigger className="mt-2" data-testid="payment-gateway-select">
                  <SelectValue placeholder="Select a payment gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (WhatsApp only)</SelectItem>
                  {PAYMENT_GATEWAYS.map(gw => (
                    <SelectItem key={gw.value} value={gw.value}>
                      <span className="flex items-center gap-2">
                        <span>{gw.icon}</span>
                        <span>{gw.label}</span>
                        <span className="text-xs text-muted-foreground">- {gw.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Razorpay Config */}
            {business.payment_gateway === 'razorpay' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇮🇳</span>
                  <h3 className="font-medium">Razorpay Configuration</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get your API keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Razorpay Dashboard</a>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razorpayKeyId">Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      data-testid="razorpay-key-id-input"
                      placeholder="rzp_test_..."
                      value={business.razorpay_key_id || ''}
                      onChange={(e) => setBusiness({...business, razorpay_key_id: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="razorpayKeySecret">Key Secret</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="razorpayKeySecret"
                        data-testid="razorpay-key-secret-input"
                        type={showSecrets.razorpay ? 'text' : 'password'}
                        placeholder="Enter your key secret"
                        value={business.razorpay_key_secret || ''}
                        onChange={(e) => setBusiness({...business, razorpay_key_secret: e.target.value})}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => toggleSecretVisibility('razorpay')}>
                        {showSecrets.razorpay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Config */}
            {business.payment_gateway === 'stripe' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💳</span>
                  <h3 className="font-medium">Stripe Configuration</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Stripe Dashboard</a>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                    <Input
                      id="stripePublishableKey"
                      data-testid="stripe-publishable-key-input"
                      placeholder="pk_test_..."
                      value={business.stripe_publishable_key || ''}
                      onChange={(e) => setBusiness({...business, stripe_publishable_key: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="stripeSecretKey"
                        data-testid="stripe-secret-key-input"
                        type={showSecrets.stripe ? 'text' : 'password'}
                        placeholder="sk_test_..."
                        value={business.stripe_secret_key || ''}
                        onChange={(e) => setBusiness({...business, stripe_secret_key: e.target.value})}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => toggleSecretVisibility('stripe')}>
                        {showSecrets.stripe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PayU Config */}
            {business.payment_gateway === 'payu' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏦</span>
                  <h3 className="font-medium">PayU Configuration</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get your credentials from <a href="https://dashboard.payu.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PayU Dashboard</a>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payuMerchantKey">Merchant Key</Label>
                    <Input
                      id="payuMerchantKey"
                      data-testid="payu-merchant-key-input"
                      placeholder="Enter merchant key"
                      value={business.payu_merchant_key || ''}
                      onChange={(e) => setBusiness({...business, payu_merchant_key: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payuMerchantSalt">Merchant Salt</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="payuMerchantSalt"
                        data-testid="payu-merchant-salt-input"
                        type={showSecrets.payu ? 'text' : 'password'}
                        placeholder="Enter merchant salt"
                        value={business.payu_merchant_salt || ''}
                        onChange={(e) => setBusiness({...business, payu_merchant_salt: e.target.value})}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => toggleSecretVisibility('payu')}>
                        {showSecrets.payu ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PhonePe Config */}
            {business.payment_gateway === 'phonepe' && (
              <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📱</span>
                  <h3 className="font-medium">PhonePe Configuration</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get your credentials from <a href="https://business.phonepe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PhonePe Business Dashboard</a>
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phonepeMerchantId">Merchant ID</Label>
                    <Input
                      id="phonepeMerchantId"
                      data-testid="phonepe-merchant-id-input"
                      placeholder="MERCHANTID"
                      value={business.phonepe_merchant_id || ''}
                      onChange={(e) => setBusiness({...business, phonepe_merchant_id: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phonepeSaltKey">Salt Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="phonepeSaltKey"
                        data-testid="phonepe-salt-key-input"
                        type={showSecrets.phonepe ? 'text' : 'password'}
                        placeholder="Enter salt key"
                        value={business.phonepe_salt_key || ''}
                        onChange={(e) => setBusiness({...business, phonepe_salt_key: e.target.value})}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => toggleSecretVisibility('phonepe')}>
                        {showSecrets.phonepe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phonepeSaltIndex">Salt Index</Label>
                    <Input
                      id="phonepeSaltIndex"
                      data-testid="phonepe-salt-index-input"
                      type="number"
                      placeholder="1"
                      value={business.phonepe_salt_index || ''}
                      onChange={(e) => setBusiness({...business, phonepe_salt_index: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            {business.payment_gateway && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> {business.payment_gateway === 'razorpay' && business.razorpay_key_id && business.razorpay_key_secret ? '✅ Razorpay configured' :
                    business.payment_gateway === 'stripe' && business.stripe_secret_key ? '✅ Stripe configured' :
                    business.payment_gateway === 'payu' && business.payu_merchant_key && business.payu_merchant_salt ? '✅ PayU configured' :
                    business.payment_gateway === 'phonepe' && business.phonepe_merchant_id && business.phonepe_salt_key ? '✅ PhonePe configured' :
                    '⚠️ Please complete the configuration above'}
                </p>
              </div>
            )}
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