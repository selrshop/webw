import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';
import { openWhatsApp } from '@/utils/whatsapp';

const BookingsPage = () => {
  const { businessId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {
      const [bookingsRes, businessRes] = await Promise.all([
        api.get(`/businesses/${businessId}/bookings`),
        api.get(`/businesses/${businessId}`)
      ]);
      setBookings(bookingsRes.data);
      setBusiness(businessRes.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCustomer = (booking) => {
    const message = `Hi ${booking.customer_name}, regarding your booking for ${booking.service_type} on ${booking.preferred_date} at ${booking.preferred_time}.`;
    openWhatsApp(booking.customer_phone, message);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage customer booking requests</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Bookings from your customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} data-testid={`booking-${booking.id}`} className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-heading font-semibold">{booking.customer_name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'pending' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{booking.customer_phone}</span>
                      </div>
                      {booking.customer_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{booking.customer_email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.preferred_date} at {booking.preferred_time}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Service: {booking.service_type}</p>
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground">Notes: {booking.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      data-testid={`contact-customer-${booking.id}`}
                      onClick={() => handleContactCustomer(booking)}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full"
                    >
                      Contact on WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;