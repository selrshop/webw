import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';
import { openWhatsApp } from '@/utils/whatsapp';

const OrdersPage = () => {
  const { businessId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {
      const [ordersRes, businessRes] = await Promise.all([
        api.get(`/businesses/${businessId}/orders`),
        api.get(`/businesses/${businessId}`)
      ]);
      setOrders(ordersRes.data);
      setBusiness(businessRes.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCustomer = (order) => {
    const itemsList = order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ');
    const message = `Hi ${order.customer_name}, regarding your order: ${itemsList}. Total: ₹${order.total_amount}`;
    openWhatsApp(order.customer_phone, message);
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
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders from your customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} data-testid={`order-${order.id}`} className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-heading font-semibold">{order.customer_name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                      {order.customer_address && (
                        <p className="text-sm text-muted-foreground">Delivery: {order.customer_address}</p>
                      )}
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium mb-2">Order Items:</p>
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-border mt-2 pt-2 flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-primary">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-muted-foreground">Notes: {order.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      data-testid={`contact-customer-${order.id}`}
                      onClick={() => handleContactCustomer(order)}
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

export default OrdersPage;