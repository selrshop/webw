import { useState } from 'react';
import { MessageCircle, Phone, MapPin, Clock, Calendar, Award, Stethoscope, User, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { openWhatsApp } from '@/utils/whatsapp';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const DoctorTemplate = ({ business, products }) => {
  const [showAppointment, setShowAppointment] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });

  const services = products || [];

  const handleAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/businesses/${business.id}/bookings`, appointmentData);
      const message = `Appointment Request from ${appointmentData.customer_name}\\n\\nService: ${appointmentData.service_type}\\nDate: ${appointmentData.preferred_date}\\nTime: ${appointmentData.preferred_time}\\nPhone: ${appointmentData.customer_phone}\\nEmail: ${appointmentData.customer_email}\\nSymptoms/Notes: ${appointmentData.notes}`;
      openWhatsApp(business.whatsapp_number, message);
      toast.success('Appointment request sent! We will confirm shortly.');
      setShowAppointment(false);
      setAppointmentData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Top Info Bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{business.whatsapp_number}</span>
            </div>
            {business.business_hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{business.business_hours}</span>
              </div>
            )}
          </div>
          <Button 
            onClick={() => openWhatsApp(business.whatsapp_number, 'I need urgent medical assistance')} 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Emergency Contact
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {business.logo_url && (
                <img src={business.logo_url} alt="Logo" className="h-16 w-16 rounded-full object-cover border-4 border-blue-100" />
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-blue-900">{business.name}</h1>
                <p className="text-gray-600">{business.category}</p>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <Button 
                onClick={() => setShowEnquiry(true)} 
                variant="outline" 
                className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Mail className="w-4 h-4 mr-2" /> Enquire Now
              </Button>
              <Button 
                onClick={() => setShowAppointment(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                <Calendar className="w-4 h-4 mr-2" /> Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Doctor Profile */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Expert Medical Care You Can Trust
              </h2>
              <p className="text-xl mb-6 text-blue-100">{business.description}</p>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Experienced & Qualified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Patient-Centered Care</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Modern Facilities</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowAppointment(true)} 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8"
                >
                  Book Appointment
                </Button>
                <Button 
                  onClick={() => openWhatsApp(business.whatsapp_number, 'Hello, I would like to know more about your services')} 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                </Button>
              </div>
            </div>
            <div className="relative">
              {business.cover_image_url ? (
                <img 
                  src={business.cover_image_url} 
                  alt="Doctor" 
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
              ) : (
                <div className="bg-blue-700 rounded-2xl p-12 text-center">
                  <Stethoscope className="w-32 h-32 mx-auto mb-4 text-blue-300" />
                  <p className="text-xl">Professional Medical Care</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-8 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
              <MapPin className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Location</h3>
              <p className="text-gray-600 text-sm">{business.address || 'Visit us for consultation'}</p>
              {business.location_map_url && (
                <a href={business.location_map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                  View on Map →
                </a>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
              <Clock className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Working Hours</h3>
              <p className="text-gray-600 text-sm">{business.business_hours || 'Mon-Sat: 9 AM - 6 PM'}</p>
              <p className="text-green-600 text-sm mt-2 font-medium">Open Today</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
              <Phone className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Contact</h3>
              <p className="text-gray-600 text-sm mb-2">Phone: {business.whatsapp_number}</p>
              {business.mobile_number && <p className="text-gray-600 text-sm">Alt: {business.mobile_number}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Services/Treatments */}
      {services.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold text-blue-900 mb-4">Our Services</h2>
              <p className="text-xl text-gray-600">Comprehensive medical care for your health needs</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div 
                  key={service.id} 
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    {service.mrp && (
                      <div className="text-right">
                        {service.mrp > service.sale_price && (
                          <div className="text-sm text-gray-400 line-through">{'\u20B9'}{service.mrp}</div>
                        )}
                        <div className="text-xl font-bold text-blue-600">{'\u20B9'}{service.sale_price || service.price}</div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  {service.category && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {service.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About/Credentials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-heading font-bold text-blue-900 mb-6">Why Choose Us?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Experienced Professionals</h3>
                    <p className="text-gray-600">Highly qualified doctors with years of expertise</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Quality Treatment</h3>
                    <p className="text-gray-600">Evidence-based medical care with modern equipment</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Patient-Centered</h3>
                    <p className="text-gray-600">Compassionate care tailored to your needs</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {business.youtube_video_url && (
                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                  <iframe 
                    src={business.youtube_video_url.replace('watch?v=', 'embed/')} 
                    className="w-full h-full" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              )}
              {business.gallery_images && business.gallery_images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {business.gallery_images.slice(0, 4).map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Clinic ${idx + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Take Care of Your Health?</h2>
          <p className="text-xl mb-8 text-blue-100">Book an appointment today or reach out for any queries</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAppointment(true)} 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-10"
            >
              <Calendar className="w-5 h-5 mr-2" /> Book Appointment
            </Button>
            <Button 
              onClick={() => openWhatsApp(business.whatsapp_number)} 
              size="lg" 
              className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-10"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Appointment Dialog */}
      <Dialog open={showAppointment} onOpenChange={setShowAppointment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-900">Book an Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAppointment} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                required 
                value={appointmentData.customer_name} 
                onChange={(e) => setAppointmentData({...appointmentData, customer_name: e.target.value})}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  required 
                  value={appointmentData.customer_phone} 
                  onChange={(e) => setAppointmentData({...appointmentData, customer_phone: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={appointmentData.customer_email} 
                  onChange={(e) => setAppointmentData({...appointmentData, customer_email: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service">Service/Consultation Type *</Label>
              <Input 
                id="service" 
                required 
                placeholder="e.g., General Checkup, Dental, etc."
                value={appointmentData.service_type} 
                onChange={(e) => setAppointmentData({...appointmentData, service_type: e.target.value})}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  required 
                  value={appointmentData.preferred_date} 
                  onChange={(e) => setAppointmentData({...appointmentData, preferred_date: e.target.value})}
                  className="mt-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <Input 
                  id="time" 
                  type="time" 
                  required 
                  value={appointmentData.preferred_time} 
                  onChange={(e) => setAppointmentData({...appointmentData, preferred_time: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Symptoms / Additional Notes</Label>
              <Textarea 
                id="notes" 
                value={appointmentData.notes} 
                onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                placeholder="Please describe your symptoms or any specific concerns..."
                className="mt-2"
                rows={3}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-full text-lg"
            >
              Confirm Appointment Request
            </Button>
            <p className="text-sm text-gray-500 text-center">
              * We will confirm your appointment via WhatsApp/Phone
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{business.name}</h3>
              <p className="text-gray-400 text-sm">{business.description}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="cursor-pointer hover:text-white">Services</p>
                <p className="cursor-pointer hover:text-white">About Us</p>
                <p className="cursor-pointer hover:text-white">Contact</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Emergency Contact</h3>
              <p className="text-gray-400 text-sm mb-2">{business.whatsapp_number}</p>
              <Button 
                onClick={() => openWhatsApp(business.whatsapp_number, 'Medical Emergency')} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Contact Now
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            Powered by <span className="font-semibold text-white">WAConnect</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoctorTemplate;
