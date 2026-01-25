import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

// Import template components
import RestaurantTemplate from './templates/RestaurantTemplate';
import RetailTemplate from './templates/RetailTemplate';
import DoctorTemplate from './templates/DoctorTemplate';
// Generic fallback for other templates
import GenericTemplate from './CustomerSiteGeneric';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const CustomerSite = () => {
  const { subdomain } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [subdomain]);

  const fetchData = async () => {
    try {
      const [businessRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE}/public/businesses/${subdomain}`),
        axios.get(`${API_BASE}/businesses/${subdomain}/products`).catch(() => ({ data: [] }))
      ]);
      
      setBusiness(businessRes.data);
      
      // Fetch products using business ID
      if (businessRes.data.id) {
        const prodsRes = await axios.get(`${API_BASE}/businesses/${businessRes.data.id}/products`);
        setProducts(prodsRes.data.filter(p => p.is_available));
      }
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business not found</h2>
          <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate template based on business type
  const templateType = business.template_type;
  
  if (templateType === 'restaurant') {
    return <RestaurantTemplate business={business} products={products} />;
  }
  
  if (templateType === 'retail' || templateType === 'grocery') {
    return <RetailTemplate business={business} products={products} />;
  }
  
  if (templateType === 'doctor' || templateType === 'clinic' || templateType === 'diagnostic') {
    return <DoctorTemplate business={business} products={products} />;
  }
  
  // Fallback to generic template for other business types
  return <GenericTemplate business={business} products={products} />;
};

export default CustomerSite;
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

const CustomerSite = () => {
  const { subdomain } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  });
  const [orderData, setOrderData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [subdomain]);

  const fetchData = async () => {
    try {
      const [businessRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE}/public/businesses/${subdomain}`),
        axios.get(`${API_BASE}/businesses/${subdomain}/products`).catch(() => ({ data: [] }))
      ]);
      
      setBusiness(businessRes.data);
      
      // Fetch products using business ID
      if (businessRes.data.id) {
        const prodsRes = await axios.get(`${API_BASE}/businesses/${businessRes.data.id}/products`);
        setProducts(prodsRes.data.filter(p => p.is_available));
      }
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/businesses/${business.id}/bookings`, bookingData);
      toast.success('Booking submitted! We\'ll contact you soon.');
      
      // Send WhatsApp message
      const message = `New booking request from ${bookingData.customer_name} for ${bookingData.service_type} on ${bookingData.preferred_date} at ${bookingData.preferred_time}`;
      openWhatsApp(business.whatsapp_number, message);
      
      setShowBookingDialog(false);
      setBookingData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to submit booking');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    try {
      const orderPayload = {
        ...orderData,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };
      
      await axios.post(`${API_BASE}/businesses/${business.id}/orders`, orderPayload);
      
      // Create WhatsApp message
      const itemsList = cart.map(item => `${item.quantity}x ${item.name} (₹${item.price})`).join(', ');
      const message = `New order from ${orderData.customer_name}:\n${itemsList}\nTotal: ₹${getTotalAmount()}\nPhone: ${orderData.customer_phone}\nAddress: ${orderData.customer_address}`;
      openWhatsApp(business.whatsapp_number, message);
      
      toast.success('Order placed! We\'ll contact you on WhatsApp.');
      setCart([]);
      setShowOrderDialog(false);
      setOrderData({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business not found</h2>
          <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero relative">
        {business.cover_image_url && (
          <div className="absolute inset-0">
            <img src={business.cover_image_url} alt={business.name} className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {business.logo_url && (
              <img src={business.logo_url} alt={business.name} className="h-20 mx-auto mb-6" />
            )}
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{business.name}</h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">{business.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                data-testid="hero-whatsapp-btn"
                onClick={() => openWhatsApp(business.whatsapp_number, `Hi! I'm interested in ${business.name}`)}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 py-6 text-lg shadow-lg"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Chat on WhatsApp
              </Button>
              <Button
                data-testid="hero-booking-btn"
                onClick={() => setShowBookingDialog(true)}
                className="bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-full px-8 py-6 text-lg"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Info */}
      <section className="py-8 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>{business.whatsapp_number}</span>
            </div>
            {business.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{business.address}</span>
              </div>
            )}
            {business.business_hours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>{business.business_hours}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      {products.length > 0 && (
        <section className="py-16 bg-background" data-testid="products-section">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Our Products</h2>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} data-testid={`product-${product.id}`} className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden group hover:shadow-md transition-all">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-heading font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">₹{product.price}</span>
                      <Button
                        data-testid={`add-to-cart-${product.id}`}
                        onClick={() => addToCart(product)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white rounded-full"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            data-testid="view-cart-btn"
            onClick={() => setShowOrderDialog(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl px-6 py-6 text-lg relative"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            View Cart ({cart.length})
            <span className="absolute -top-2 -right-2 bg-secondary text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">WAConnect</span>
          </p>
        </div>
      </footer>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md" data-testid="booking-dialog">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bookName">Your Name *</Label>
              <Input
                id="bookName"
                data-testid="booking-name-input"
                value={bookingData.customer_name}
                onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bookPhone">Phone Number *</Label>
              <Input
                id="bookPhone"
                data-testid="booking-phone-input"
                value={bookingData.customer_phone}
                onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bookEmail">Email</Label>
              <Input
                id="bookEmail"
                data-testid="booking-email-input"
                type="email"
                value={bookingData.customer_email}
                onChange={(e) => setBookingData({...bookingData, customer_email: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bookService">Service Type *</Label>
              <Input
                id="bookService"
                data-testid="booking-service-input"
                value={bookingData.service_type}
                onChange={(e) => setBookingData({...bookingData, service_type: e.target.value})}
                required
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookDate">Preferred Date *</Label>
                <Input
                  id="bookDate"
                  data-testid="booking-date-input"
                  type="date"
                  value={bookingData.preferred_date}
                  onChange={(e) => setBookingData({...bookingData, preferred_date: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bookTime">Preferred Time *</Label>
                <Input
                  id="bookTime"
                  data-testid="booking-time-input"
                  type="time"
                  value={bookingData.preferred_time}
                  onChange={(e) => setBookingData({...bookingData, preferred_time: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bookNotes">Additional Notes</Label>
              <Textarea
                id="bookNotes"
                data-testid="booking-notes-input"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                className="mt-2"
                rows={3}
              />
            </div>
            <Button type="submit" data-testid="submit-booking-btn" className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
              Submit Booking
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-md" data-testid="order-dialog">
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    data-testid={`decrease-qty-${item.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    data-testid={`increase-qty-${item.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    data-testid={`remove-item-${item.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center py-3 font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderName">Your Name *</Label>
                <Input
                  id="orderName"
                  data-testid="order-name-input"
                  value={orderData.customer_name}
                  onChange={(e) => setOrderData({...orderData, customer_name: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="orderPhone">Phone Number *</Label>
                <Input
                  id="orderPhone"
                  data-testid="order-phone-input"
                  value={orderData.customer_phone}
                  onChange={(e) => setOrderData({...orderData, customer_phone: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="orderAddress">Delivery Address</Label>
                <Textarea
                  id="orderAddress"
                  data-testid="order-address-input"
                  value={orderData.customer_address}
                  onChange={(e) => setOrderData({...orderData, customer_address: e.target.value})}
                  className="mt-2"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="orderNotes">Additional Notes</Label>
                <Textarea
                  id="orderNotes"
                  data-testid="order-notes-input"
                  value={orderData.notes}
                  onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                  className="mt-2"
                  rows={2}
                />
              </div>
              <Button type="submit" data-testid="submit-order-btn" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Place Order via WhatsApp
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSite;