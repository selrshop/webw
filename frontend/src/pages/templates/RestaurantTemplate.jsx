import { useState } from 'react';
import { MessageCircle, Phone, MapPin, Clock, ShoppingCart, Star, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { openWhatsApp } from '@/utils/whatsapp';
import DeliveryCalculator from '@/components/DeliveryCalculator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const RestaurantTemplate = ({ business, products }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderData, setOrderData] = useState({ customer_name: '', customer_phone: '', customer_address: '', notes: '' });
  const [bookingData, setBookingData] = useState({ customer_name: '', customer_phone: '', service_type: 'Table Reservation', preferred_date: '', preferred_time: '', notes: '' });

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
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

  const getSubtotal = () => cart.reduce((sum, item) => sum + ((item.sale_price || item.price) * item.quantity), 0);
  const getTax = () => (getSubtotal() * (business.tax_percentage || 0)) / 100;
  const getDelivery = () => {
    if (business.min_order_for_free_delivery && getSubtotal() >= business.min_order_for_free_delivery) return 0;
    return business.delivery_charges || 0;
  };
  const getTotal = () => getSubtotal() + getTax() + getDelivery();

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error('Cart is empty');
    
    try {
      const orderPayload = {
        ...orderData,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      };
      await axios.post(`${API_BASE}/businesses/${business.id}/orders`, orderPayload);
      
      const itemsList = cart.map(item => `${item.quantity}x ${item.name} ({'₹'}${item.sale_price || item.price})`).join(', ');
      const message = `New order from ${orderData.customer_name}:\n${itemsList}\nSubtotal: {'₹'}${getSubtotal()}\nTax: {'₹'}${getTax().toFixed(2)}\nDelivery: {'₹'}${getDelivery()}\nTotal: {'₹'}${getTotal().toFixed(2)}\nPhone: ${orderData.customer_phone}\nAddress: ${orderData.customer_address}`;
      openWhatsApp(business.whatsapp_number, message);
      
      toast.success('Order placed! We\'ll contact you on WhatsApp.');
      setCart([]);
      setShowCart(false);
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/businesses/${business.id}/bookings`, bookingData);
      const message = `Table reservation from ${bookingData.customer_name} for ${bookingData.preferred_date} at ${bookingData.preferred_time}. Party size: ${bookingData.notes || 'Not specified'}`;
      openWhatsApp(business.whatsapp_number, message);
      toast.success('Booking request sent!');
      setShowBooking(false);
    } catch (error) {
      toast.error('Failed to book');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)' }}>
      {/* Hero with Cover */}
      <div className="relative h-96 overflow-hidden">
        {business.cover_image_url && (
          <img src={business.cover_image_url} alt={business.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            {business.logo_url && <img src={business.logo_url} alt="Logo" className="h-16 mb-4 rounded-lg" />}
            <h1 className="text-5xl font-heading font-bold mb-2">{business.name}</h1>
            <p className="text-xl mb-4">{business.description}</p>
            <div className="flex gap-4">
              <Button onClick={() => openWhatsApp(business.whatsapp_number)} className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-6">
                <MessageCircle className="w-5 h-5 mr-2" /> Order Now
              </Button>
              <Button onClick={() => setShowBooking(true)} variant="secondary" className="rounded-full px-6">
                <Clock className="w-5 h-5 mr-2" /> Reserve Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border-y shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-600" /> {business.whatsapp_number}</div>
          {business.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600" /> {business.address}</div>}
          {business.business_hours && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600" /> {business.business_hours}</div>}
          {business.social_media_links?.instagram && <a href={business.social_media_links.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-5 h-5 text-orange-600 hover:text-orange-700" /></a>}
          {business.social_media_links?.facebook && <a href={business.social_media_links.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5 text-orange-600 hover:text-orange-700" /></a>}
        </div>
      </div>

      {/* Menu Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-heading font-bold mb-8 text-center">Our Menu</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
              {product.image_url && (
                <div className="relative h-56 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {product.is_veg !== null && (
                    <div className={`absolute top-3 right-3 w-6 h-6 border-2 flex items-center justify-center ${
                      product.is_veg ? 'border-green-600' : 'border-red-600'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        product.is_veg ? 'bg-green-600' : 'bg-red-600'
                      }`} />
                    </div>
                  )}
                  {product.discount_percentage > 0 && (
                    <Badge className="absolute top-3 left-3 bg-red-600 text-white">
                      {product.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-heading font-bold mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.mrp > product.sale_price && (
                      <span className="text-sm text-gray-400 line-through mr-2">{'₹'}{product.mrp}</span>
                    )}
                    <span className="text-2xl font-bold text-orange-600">{'₹'}{product.sale_price || product.price}</span>
                  </div>
                  <Button onClick={() => addToCart(product)} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full">
                    Add +
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      {business.gallery_images && business.gallery_images.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-heading font-bold mb-8 text-center">Gallery</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {business.gallery_images.slice(0, 8).map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-orange-600 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 hover:bg-orange-700 z-50"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
          <span className="text-lg">{'₹'}{getSubtotal()}</span>
        </button>
      )}

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Your Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{'₹'}{item.sale_price || item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, 1)}>+</Button>
                </div>
              </div>
            ))}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between"><span>Subtotal:</span><span>{'₹'}{getSubtotal()}</span></div>
              <div className="flex justify-between text-sm"><span>Tax ({business.tax_percentage}%):</span><span>{'₹'}{getTax().toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Delivery:</span><span>{'₹'}{getDelivery()}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{'₹'}{getTotal().toFixed(2)}</span></div>
            </div>
            <form onSubmit={handleOrder} className="space-y-3">
              <div><Label>Your Name *</Label><Input required value={orderData.customer_name} onChange={(e) => setOrderData({...orderData, customer_name: e.target.value})} /></div>
              <div><Label>Phone *</Label><Input required value={orderData.customer_phone} onChange={(e) => setOrderData({...orderData, customer_phone: e.target.value})} /></div>
              <div><Label>Delivery Address</Label><Textarea value={orderData.customer_address} onChange={(e) => setOrderData({...orderData, customer_address: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">Place Order via WhatsApp</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent><DialogHeader><DialogTitle>Reserve a Table</DialogTitle></DialogHeader>
          <form onSubmit={handleBooking} className="space-y-3">
            <div><Label>Name *</Label><Input required value={bookingData.customer_name} onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})} /></div>
            <div><Label>Phone *</Label><Input required value={bookingData.customer_phone} onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input required type="date" value={bookingData.preferred_date} onChange={(e) => setBookingData({...bookingData, preferred_date: e.target.value})} /></div>
              <div><Label>Time *</Label><Input required type="time" value={bookingData.preferred_time} onChange={(e) => setBookingData({...bookingData, preferred_time: e.target.value})} /></div>
            </div>
            <div><Label>Party Size / Notes</Label><Input value={bookingData.notes} onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} placeholder="e.g., 4 people" /></div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">Confirm Reservation</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">Powered by <span className="font-semibold text-white">WAConnect</span></p>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantTemplate;