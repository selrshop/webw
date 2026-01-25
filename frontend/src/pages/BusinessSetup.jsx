import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/utils/api';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const BusinessSetup = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subdomain: '',
    whatsapp_number: '',
    mobile_number: '',
    category: '',
    template_type: '',
    address: '',
    business_hours: '',
    logo_url: '',
    cover_image_url: '',
    youtube_video_url: '',
    location_map_url: '',
    gallery_images: [],
    social_media_links: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      pinterest: ''
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/templates`);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

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

  const addGalleryImage = () => {
    if (formData.gallery_images.length < 16) {
      setFormData({
        ...formData,
        gallery_images: [...formData.gallery_images, '']
      });
    } else {
      toast.error('Maximum 16 images allowed');
    }
  };

  const updateGalleryImage = (index, value) => {
    const newGallery = [...formData.gallery_images];
    newGallery[index] = value;
    setFormData({...formData, gallery_images: newGallery});
  };

  const removeGalleryImage = (index) => {
    const newGallery = formData.gallery_images.filter((_, i) => i !== index);
    setFormData({...formData, gallery_images: newGallery});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Create Your Business Website</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-8">
            <h2 className="text-2xl font-heading font-semibold mb-6">Choose Your Template</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  data-testid={`template-${template.id}`}
                  onClick={() => {
                    setFormData({...formData, template_type: template.id, category: template.name});
                  }}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.template_type === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold">{template.name}</h3>
                    {formData.template_type === template.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                data-testid="next-step-1"
                onClick={() => setStep(2)}
                disabled={!formData.template_type}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="bg-white rounded-2xl shadow-sm border border-border/50 p-8 space-y-6">
            <h2 className="text-2xl font-heading font-semibold mb-6">Business Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  data-testid="business-name"
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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  data-testid="business-description"
                  placeholder="Brief description of your business"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  data-testid="whatsapp-number"
                  placeholder="919876543210"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="Additional contact number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="subdomain">Your Website URL *</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="subdomain"
                    data-testid="subdomain"
                    placeholder="your-business"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
                    required
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">.waconnect.site</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full business address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="hours">Business Hours</Label>
                <Input
                  id="hours"
                  placeholder="e.g., Mon-Sat: 9 AM - 9 PM"
                  value={formData.business_hours}
                  onChange={(e) => setFormData({...formData, business_hours: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="map">Google Maps URL</Label>
                <Input
                  id="map"
                  placeholder="Google Maps link"
                  value={formData.location_map_url}
                  onChange={(e) => setFormData({...formData, location_map_url: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full">
                Back
              </Button>
              <Button type="submit" data-testid="next-step-2" className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-border/50 p-8 space-y-6">
            <h2 className="text-2xl font-heading font-semibold mb-6">Media & Social Links</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="cover">Cover Photo URL</Label>
                <Input
                  id="cover"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube Video URL</Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.youtube_video_url}
                  onChange={(e) => setFormData({...formData, youtube_video_url: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Gallery Images (Up to 16)</Label>
                <div className="space-y-2 mt-2">
                  {formData.gallery_images.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Image ${idx + 1} URL`}
                        value={img}
                        onChange={(e) => updateGalleryImage(idx, e.target.value)}
                      />
                      <Button type="button" variant="ghost" onClick={() => removeGalleryImage(idx)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  {formData.gallery_images.length < 16 && (
                    <Button type="button" variant="outline" onClick={addGalleryImage} className="w-full">
                      + Add Gallery Image
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Social Media Links</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Instagram URL"
                    value={formData.social_media_links.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, instagram: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Facebook URL"
                    value={formData.social_media_links.facebook}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, facebook: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Twitter URL"
                    value={formData.social_media_links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, twitter: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.social_media_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, linkedin: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="YouTube Channel URL"
                    value={formData.social_media_links.youtube}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, youtube: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Pinterest URL"
                    value={formData.social_media_links.pinterest}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media_links: {...formData.social_media_links, pinterest: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full">
                Back
              </Button>
              <Button
                type="submit"
                data-testid="create-business"
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Business'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BusinessSetup;