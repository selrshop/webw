import { useState } from 'react';
import { MessageCircle, ShoppingCart, Heart, Filter, X, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { openWhatsApp } from '@/utils/whatsapp';
import DeliveryCalculator from '@/components/DeliveryCalculator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const RetailTemplate = ({ business, products }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [orderData, setOrderData] = useState({ customer_name: '', customer_phone: '', customer_address: '', notes: '' });
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  let filteredProducts = filterCategory === 'All' ? products : products.filter(p => p.category === filterCategory);
  if (sortBy === 'price_low') filteredProducts = [...filteredProducts].sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
  if (sortBy === 'price_high') filteredProducts = [...filteredProducts].sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
  if (sortBy === 'discount') filteredProducts = [...filteredProducts].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));

  const addToCart = (product, size = null, color = null) => {
    const cartItem = { ...product, selectedSize: size, selectedColor: color, cartId: `${product.id}-${size}-${color}` };
    const existing = cart.find(item => item.cartId === cartItem.cartId);
    if (existing) {
      setCart(cart.map(item => item.cartId === cartItem.cartId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...cartItem, quantity: 1 }]);
    }
    toast.success('Added to cart');
    setSelectedProduct(null);
  };

  const openProductDialog = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
  };

  const updateQuantity = (cartId, change) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + ((item.sale_price || item.price) * item.quantity), 0);
  const getTax = () => (getSubtotal() * (business.tax_percentage || 0)) / 100;
  const getDelivery = () => {
    // Use location-based delivery charge if available
    if (deliveryInfo) {
      if (!deliveryInfo.isDeliverable) return 0; // Will show error separately
      return deliveryInfo.deliveryCharge;
    }
    // Fallback to order-value based delivery
    if (business.min_order_for_free_delivery && getSubtotal() >= business.min_order_for_free_delivery) return 0;
    return business.delivery_charges || 0;
  };
  const getTotal = () => getSubtotal() + getTax() + getDelivery();
  const canDeliver = () => !deliveryInfo || deliveryInfo.isDeliverable;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error('Cart is empty');
    
    try {
      const orderPayload = { ...orderData, items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })) };
      await axios.post(`${API_BASE}/businesses/${business.id}/orders`, orderPayload);
      
      const itemsList = cart.map(item => {
        let details = `${item.quantity}x ${item.name}`;
        if (item.selectedSize) details += ` (Size: ${item.selectedSize})`;
        if (item.selectedColor) details += ` (Color: ${item.selectedColor})`;
        details += ` - {'₹'}${item.sale_price || item.price}`;
        return details;
      }).join('\n');
      const message = `New order from ${orderData.customer_name}:\n\n${itemsList}\n\nSubtotal: {'₹'}${getSubtotal()}\nTax: {'₹'}${getTax().toFixed(2)}\nDelivery: {'₹'}${getDelivery()}\nTotal: {'₹'}${getTotal().toFixed(2)}\n\nPhone: ${orderData.customer_phone}\nAddress: ${orderData.customer_address}`;
      openWhatsApp(business.whatsapp_number, message);
      
      toast.success('Order placed!');
      setCart([]);
      setShowCart(false);
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {business.logo_url && <img src={business.logo_url} alt="Logo" className="h-12" />}
              <div>
                <h1 className="text-2xl font-heading font-bold">{business.name}</h1>
                <p className="text-sm text-gray-600">{business.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {business.social_media_links?.instagram && <a href={business.social_media_links.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-5 h-5 text-gray-600 hover:text-pink-600" /></a>}
              {business.social_media_links?.facebook && <a href={business.social_media_links.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5 text-gray-600 hover:text-blue-600" /></a>}
              <Button onClick={() => openWhatsApp(business.whatsapp_number)} variant="outline" className="rounded-full">
                <MessageCircle className="w-5 h-5 mr-2" /> Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {business.cover_image_url && (
        <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600">
          <img src={business.cover_image_url} alt="Banner" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">New Collection</h2>
              <p className="text-xl">Explore the latest trends</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all group cursor-pointer" onClick={() => openProductDialog(product)}>
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {product.discount_percentage > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white">{product.discount_percentage}% OFF</Badge>
                )}
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-2">
                  {product.mrp > product.sale_price && (
                    <span className="text-xs text-gray-400 line-through">{'₹'}{product.mrp}</span>
                  )}
                  <span className="text-lg font-bold text-purple-600">{'₹'}{product.sale_price || product.price}</span>
                </div>
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {product.sizes.slice(0, 4).map(size => (
                      <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">{size}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {selectedProduct.image_url && <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <div className="flex items-center gap-3 mb-4">
                  {selectedProduct.mrp > selectedProduct.sale_price && (
                    <span className="text-lg text-gray-400 line-through">{'₹'}{selectedProduct.mrp}</span>
                  )}
                  <span className="text-3xl font-bold text-purple-600">{'₹'}{selectedProduct.sale_price || selectedProduct.price}</span>
                  {selectedProduct.discount_percentage > 0 && (
                    <Badge className="bg-red-600 text-white">{selectedProduct.discount_percentage}% OFF</Badge>
                  )}
                </div>
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Select Size</Label>
                    <div className="flex gap-2">
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-lg ${selectedSize === size ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Select Color</Label>
                    <div className="flex gap-2">
                      {selectedProduct.colors.map(color => (
                        <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 border rounded-lg ${selectedColor === color ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={() => addToCart(selectedProduct, selectedSize, selectedColor)} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-6">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <button onClick={() => setShowCart(true)} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 z-50">
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
          <span>{'₹'}{getSubtotal()}</span>
        </button>
      )}

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Shopping Cart</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.cartId} className="flex gap-3 border-b pb-3">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.selectedSize && <p className="text-xs text-gray-600">Size: {item.selectedSize}</p>}
                  {item.selectedColor && <p className="text-xs text-gray-600">Color: {item.selectedColor}</p>}
                  <p className="text-sm text-purple-600">{'₹'}{item.sale_price || item.price}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.cartId, -1)}>-</Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.cartId, 1)}>+</Button>
                  </div>
                  <button onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} className="text-xs text-red-600">Remove</button>
                </div>
              </div>
            ))}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between"><span>Subtotal:</span><span>{'₹'}{getSubtotal()}</span></div>
              <div className="flex justify-between text-sm"><span>Tax:</span><span>{'₹'}{getTax().toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Delivery:</span><span>{'₹'}{getDelivery()}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{'₹'}{getTotal().toFixed(2)}</span></div>
            </div>
            <form onSubmit={handleOrder} className="space-y-3">
              <div><Label>Name *</Label><Input required value={orderData.customer_name} onChange={(e) => setOrderData({...orderData, customer_name: e.target.value})} /></div>
              <div><Label>Phone *</Label><Input required value={orderData.customer_phone} onChange={(e) => setOrderData({...orderData, customer_phone: e.target.value})} /></div>
              <div><Label>Delivery Address *</Label><Input required value={orderData.customer_address} onChange={(e) => setOrderData({...orderData, customer_address: e.target.value})} /></div>
              <Button type="submit" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">Checkout via WhatsApp</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">Powered by <span className="font-semibold">WAConnect</span></p>
        </div>
      </footer>
    </div>
  );
};

export default RetailTemplate;