import { useState, useEffect } from 'react';
import { MessageCircle, Phone, MapPin, Mail, Calendar, Star, Award, CheckCircle, User, Briefcase, Clock, Instagram, Facebook, Twitter, Linkedin, Youtube, Pinterest } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { openWhatsApp } from '@/utils/whatsapp';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const UniversalServiceTemplate = ({ business, products }) => {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [enquiryData, setEnquiryData] = useState({ customer_name: '', customer_phone: '', customer_email: '', notes: '' });
  const [bookingData, setBookingData] = useState({ customer_name: '', customer_phone: '', customer_email: '', service_type: '', preferred_date: '', preferred_time: '', notes: '' });

  // Dynamic theming based on business colors
  const colors = {
    primary: business.primary_color || '#2563eb',
    secondary: business.secondary_color || '#3b82f6',
    accent: business.accent_color || '#60a5fa'
  };

  const services = products || [];
  const testimonials = business.reviews || [];

  const socialIcons = [
    { platform: 'instagram', icon: Instagram, url: business.social_media_links?.instagram },
    { platform: 'facebook', icon: Facebook, url: business.social_media_links?.facebook },
    { platform: 'twitter', icon: Twitter, url: business.social_media_links?.twitter },
    { platform: 'linkedin', icon: Linkedin, url: business.social_media_links?.linkedin },
    { platform: 'youtube', icon: Youtube, url: business.social_media_links?.youtube },
    { platform: 'pinterest', icon: Pinterest, url: business.social_media_links?.pinterest }
  ].filter(s => s.url);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    const message = `Enquiry from ${enquiryData.customer_name}\\n\\nPhone: ${enquiryData.customer_phone}\\nEmail: ${enquiryData.customer_email}\\nMessage: ${enquiryData.notes}`;
    openWhatsApp(business.whatsapp_number, message);
    toast.success('Enquiry sent! We will get back to you soon.');
    setShowEnquiry(false);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/businesses/${business.id}/bookings`, bookingData);
      const message = `Booking Request from ${bookingData.customer_name}\\n\\nService: ${bookingData.service_type}\\nDate: ${bookingData.preferred_date}\\nTime: ${bookingData.preferred_time}\\nPhone: ${bookingData.customer_phone}\\nNotes: ${bookingData.notes}`;
      openWhatsApp(business.whatsapp_number, message);
      toast.success('Booking request sent!');
      setShowBooking(false);
    } catch (error) {
      toast.error('Failed to send booking');
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <style>{`
        .theme-primary { background-color: ${colors.primary}; }
        .theme-primary-text { color: ${colors.primary}; }
        .theme-primary-border { border-color: ${colors.primary}; }
        .theme-secondary { background-color: ${colors.secondary}; }
        .theme-accent { background-color: ${colors.accent}; }
        .theme-gradient { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); }
      `}</style>

      {/* Top Contact Bar */}
      <div className=\"theme-primary text-white py-2 text-sm\">
        <div className=\"max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2\">
          <div className=\"flex items-center gap-4\">
            <div className=\"flex items-center gap-2\">
              <Phone className=\"w-4 h-4\" />
              <span>{business.whatsapp_number}</span>
            </div>
            {business.business_hours && (
              <div className=\"flex items-center gap-2\">
                <Clock className=\"w-4 h-4\" />
                <span>{business.business_hours}</span>
              </div>
            )}
          </div>
          <div className=\"flex items-center gap-3\">
            {socialIcons.map(({ platform, icon: Icon, url }) => (
              <a key={platform} href={url} target=\"_blank\" rel=\"noopener noreferrer\" className=\"hover:opacity-80\">
                <Icon className=\"w-4 h-4\" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className=\"bg-white shadow-md sticky top-0 z-40\">
        <div className=\"max-w-7xl mx-auto px-4 py-4\">
          <div className=\"flex justify-between items-center\">
            <div className=\"flex items-center gap-4\">
              {business.logo_url && (
                <img src={business.logo_url} alt=\"Logo\" className=\"h-14 w-14 rounded-lg object-cover\" />
              )}
              <div>
                <h1 className=\"text-2xl md:text-3xl font-heading font-bold theme-primary-text\">{business.name}</h1>
                <p className=\"text-gray-600 text-sm\">{business.category}</p>
              </div>
            </div>
            <div className=\"flex gap-2\">
              <Button onClick={() => setShowEnquiry(true)} variant=\"outline\" className=\"rounded-full theme-primary-border theme-primary-text\">
                <Mail className=\"w-4 h-4 mr-2\" /> Enquire
              </Button>
              <Button onClick={() => setShowBooking(true)} className=\"theme-primary text-white rounded-full hover:opacity-90\">
                <Calendar className=\"w-4 h-4 mr-2\" /> Book Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className=\"theme-gradient text-white py-20\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid md:grid-cols-2 gap-12 items-center\">
            <div>
              <h2 className=\"text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight\">
                {business.description || `Professional ${business.category} Services`}
              </h2>
              <p className=\"text-xl mb-8 text-white/90\">
                Trusted by clients for quality service and expert consultation
              </p>
              <div className=\"flex flex-wrap gap-4 mb-8\">
                <div className=\"flex items-center gap-2\">
                  <CheckCircle className=\"w-6 h-6\" />
                  <span>Professional</span>
                </div>
                <div className=\"flex items-center gap-2\">
                  <CheckCircle className=\"w-6 h-6\" />
                  <span>Experienced</span>
                </div>
                <div className=\"flex items-center gap-2\">
                  <CheckCircle className=\"w-6 h-6\" />
                  <span>Reliable</span>
                </div>
              </div>
              <div className=\"flex gap-4\">
                <Button onClick={() => setShowBooking(true)} size=\"lg\" className=\"bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8\">
                  Get Started
                </Button>
                <Button onClick={() => openWhatsApp(business.whatsapp_number, 'Hello, I would like to know more')} size=\"lg\" variant=\"outline\" className=\"border-2 border-white text-white hover:bg-white/10 rounded-full px-8\">
                  <MessageCircle className=\"w-5 h-5 mr-2\" /> WhatsApp
                </Button>
              </div>
            </div>
            <div>
              {business.cover_image_url ? (
                <img src={business.cover_image_url} alt=\"Cover\" className=\"rounded-2xl shadow-2xl w-full\" />
              ) : (
                <div className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center\">
                  <Briefcase className=\"w-32 h-32 mx-auto mb-4 text-white/80\" />
                  <p className=\"text-xl\">Professional Services</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className=\"py-8 -mt-12 relative z-10\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid md:grid-cols-3 gap-6\">
            {business.address && (
              <div className=\"bg-white rounded-xl shadow-lg p-6 border-t-4 theme-primary-border\">
                <MapPin className=\"w-10 h-10 theme-primary-text mb-3\" />
                <h3 className=\"font-bold text-lg mb-2\">Location</h3>
                <p className=\"text-gray-600 text-sm\">{business.address}</p>
                {business.location_map_url && (
                  <a href={business.location_map_url} target=\"_blank\" rel=\"noopener noreferrer\" className=\"theme-primary-text text-sm mt-2 inline-block hover:underline\">
                    View on Map →
                  </a>
                )}
              </div>
            )}
            {business.business_hours && (
              <div className=\"bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500\">
                <Clock className=\"w-10 h-10 text-green-600 mb-3\" />
                <h3 className=\"font-bold text-lg mb-2\">Working Hours</h3>
                <p className=\"text-gray-600 text-sm\">{business.business_hours}</p>
              </div>
            )}
            <div className=\"bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500\">
              <Phone className=\"w-10 h-10 text-orange-600 mb-3\" />
              <h3 className=\"font-bold text-lg mb-2\">Contact</h3>
              <p className=\"text-gray-600 text-sm\">Phone: {business.whatsapp_number}</p>
              {business.mobile_number && <p className=\"text-gray-600 text-sm\">Alt: {business.mobile_number}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className=\"py-16 bg-white\">
          <div className=\"max-w-7xl mx-auto px-4\">
            <div className=\"text-center mb-12\">
              <h2 className=\"text-4xl font-heading font-bold theme-primary-text mb-4\">Our Services</h2>
              <p className=\"text-xl text-gray-600\">Professional solutions tailored to your needs</p>
            </div>
            <div className=\"grid md:grid-cols-3 gap-6\">
              {services.map(service => (
                <div key={service.id} className=\"bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-gray-200 cursor-pointer\" onClick={() => setSelectedService(service)}>
                  <div className=\"flex justify-between items-start mb-4\">
                    <div className=\"w-14 h-14 theme-primary rounded-xl flex items-center justify-center\">
                      <Briefcase className=\"w-7 h-7 text-white\" />
                    </div>
                    {service.sale_price && (
                      <div className=\"text-right\">
                        {service.mrp > service.sale_price && (
                          <div className=\"text-sm text-gray-400 line-through\">{'\u20B9'}{service.mrp}</div>
                        )}
                        <div className=\"text-2xl font-bold theme-primary-text\">{'\u20B9'}{service.sale_price || service.price}</div>
                      </div>
                    )}
                  </div>
                  <h3 className=\"text-xl font-bold mb-2\">{service.name}</h3>
                  <p className=\"text-gray-600 text-sm mb-4\">{service.description}</p>
                  {service.category && (
                    <Badge className=\"theme-primary text-white\">{service.category}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About/Why Choose Us */}
      <section className=\"py-16 bg-gray-50\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid md:grid-cols-2 gap-12\">
            <div>
              <h2 className=\"text-4xl font-heading font-bold theme-primary-text mb-6\">Why Choose Us?</h2>
              <p className=\"text-gray-600 mb-8 text-lg\">{business.description}</p>
              <div className=\"space-y-4\">
                <div className=\"flex gap-4\">
                  <div className=\"w-12 h-12 theme-primary rounded-lg flex items-center justify-center flex-shrink-0\">
                    <Award className=\"w-6 h-6 text-white\" />
                  </div>
                  <div>
                    <h3 className=\"font-bold text-lg mb-1\">Expert Professionals</h3>
                    <p className=\"text-gray-600\">Experienced and certified in our field</p>
                  </div>
                </div>
                <div className=\"flex gap-4\">
                  <div className=\"w-12 h-12 theme-secondary rounded-lg flex items-center justify-center flex-shrink-0\">
                    <CheckCircle className=\"w-6 h-6 text-white\" />
                  </div>
                  <div>
                    <h3 className=\"font-bold text-lg mb-1\">Quality Service</h3>
                    <p className=\"text-gray-600\">Committed to excellence in every project</p>
                  </div>
                </div>
                <div className=\"flex gap-4\">
                  <div className=\"w-12 h-12 theme-accent rounded-lg flex items-center justify-center flex-shrink-0\">
                    <User className=\"w-6 h-6 text-white\" />
                  </div>
                  <div>
                    <h3 className=\"font-bold text-lg mb-1\">Client-Focused</h3>
                    <p className=\"text-gray-600\">Your satisfaction is our priority</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {business.youtube_video_url && (
                <div className=\"aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4\">
                  <iframe src={business.youtube_video_url.replace('watch?v=', 'embed/')} className=\"w-full h-full\" frameBorder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowFullScreen />
                </div>
              )}
              {business.gallery_images && business.gallery_images.length > 0 && (
                <div className=\"grid grid-cols-2 gap-4\">
                  {business.gallery_images.slice(0, 4).map((img, idx) => (
                    <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className=\"w-full h-40 object-cover rounded-xl hover:scale-105 transition-transform\" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className=\"theme-gradient text-white py-16\">
        <div className=\"max-w-4xl mx-auto px-4 text-center\">
          <h2 className=\"text-4xl font-heading font-bold mb-4\">Ready to Get Started?</h2>
          <p className=\"text-xl mb-8 text-white/90\">Contact us today for a consultation</p>
          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
            <Button onClick={() => setShowBooking(true)} size=\"lg\" className=\"bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10\">
              <Calendar className=\"w-5 h-5 mr-2\" /> Book Consultation
            </Button>
            <Button onClick={() => openWhatsApp(business.whatsapp_number)} size=\"lg\" className=\"bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-10\">
              <MessageCircle className=\"w-5 h-5 mr-2\" /> Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Enquiry Dialog */}
      <Dialog open={showEnquiry} onOpenChange={setShowEnquiry}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Enquiry</DialogTitle></DialogHeader>
          <form onSubmit={handleEnquiry} className=\"space-y-4\">
            <div><Label>Name *</Label><Input required value={enquiryData.customer_name} onChange={(e) => setEnquiryData({...enquiryData, customer_name: e.target.value})} /></div>
            <div><Label>Phone *</Label><Input required value={enquiryData.customer_phone} onChange={(e) => setEnquiryData({...enquiryData, customer_phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input type=\"email\" value={enquiryData.customer_email} onChange={(e) => setEnquiryData({...enquiryData, customer_email: e.target.value})} /></div>
            <div><Label>Message *</Label><Textarea required value={enquiryData.notes} onChange={(e) => setEnquiryData({...enquiryData, notes: e.target.value})} rows={4} /></div>
            <Button type=\"submit\" className=\"w-full theme-primary text-white rounded-full\">Send Enquiry</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Consultation</DialogTitle></DialogHeader>
          <form onSubmit={handleBooking} className=\"space-y-4\">
            <div><Label>Name *</Label><Input required value={bookingData.customer_name} onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})} /></div>
            <div className=\"grid grid-cols-2 gap-4\">
              <div><Label>Phone *</Label><Input required value={bookingData.customer_phone} onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input type=\"email\" value={bookingData.customer_email} onChange={(e) => setBookingData({...bookingData, customer_email: e.target.value})} /></div>
            </div>
            <div><Label>Service Type *</Label><Input required placeholder=\"e.g., Consultation, Planning\" value={bookingData.service_type} onChange={(e) => setBookingData({...bookingData, service_type: e.target.value})} /></div>
            <div className=\"grid grid-cols-2 gap-4\">
              <div><Label>Date *</Label><Input required type=\"date\" value={bookingData.preferred_date} onChange={(e) => setBookingData({...bookingData, preferred_date: e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
              <div><Label>Time *</Label><Input required type=\"time\" value={bookingData.preferred_time} onChange={(e) => setBookingData({...bookingData, preferred_time: e.target.value})} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={bookingData.notes} onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} rows={3} /></div>
            <Button type=\"submit\" className=\"w-full theme-primary text-white rounded-full\">Confirm Booking</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Detail Dialog */}
      {selectedService && (
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedService.name}</DialogTitle></DialogHeader>
            <div>
              <p className=\"text-gray-600 mb-4\">{selectedService.description}</p>
              {selectedService.sale_price && (
                <div className=\"mb-4\">
                  {selectedService.mrp > selectedService.sale_price && (
                    <span className=\"text-lg text-gray-400 line-through mr-2\">{'\u20B9'}{selectedService.mrp}</span>
                  )}
                  <span className=\"text-3xl font-bold theme-primary-text\">{'\u20B9'}{selectedService.sale_price || selectedService.price}</span>
                </div>
              )}
              <Button onClick={() => { setSelectedService(null); setShowBooking(true); setBookingData({...bookingData, service_type: selectedService.name}); }} className=\"w-full theme-primary text-white rounded-full\">
                Book This Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className=\"bg-gray-900 text-white py-8\">
        <div className=\"max-w-7xl mx-auto px-4 text-center\">
          <p className=\"text-sm text-gray-400\">Powered by <span className=\"font-semibold text-white\">WAConnect</span></p>
        </div>
      </footer>
    </div>
  );
};

export default UniversalServiceTemplate;
