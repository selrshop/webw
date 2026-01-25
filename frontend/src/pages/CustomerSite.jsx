import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

// Import template components
import RestaurantTemplate from './templates/RestaurantTemplate';
import RetailTemplate from './templates/RetailTemplate';
import DoctorTemplate from './templates/DoctorTemplate';
import UniversalServiceTemplate from './templates/UniversalServiceTemplate';

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
      const businessRes = await axios.get(`${API_BASE}/public/businesses/${subdomain}`);
      setBusiness(businessRes.data);
      
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business not found</h2>
          <p className="text-muted-foreground">The business you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate template based on business type
  const templateType = business.template_type;
  
  // Restaurant and food businesses
  if (templateType === 'restaurant' || templateType === 'chef') {
    return <RestaurantTemplate business={business} products={products} />;
  }
  
  // Retail, e-commerce, and product-based businesses
  if (templateType === 'retail' || templateType === 'grocery' || templateType === 'salon') {
    return <RetailTemplate business={business} products={products} />;
  }
  
  // Medical and healthcare businesses
  if (templateType === 'doctor' || templateType === 'clinic' || templateType === 'diagnostic') {
    return <DoctorTemplate business={business} products={products} />;
  }
  
  // All other service-based businesses use Universal Template
  return <UniversalServiceTemplate business={business} products={products} />;
};

export default CustomerSite;
