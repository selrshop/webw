import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Check, X, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentLocation, calculateDistance, formatDistance } from '@/utils/location';

const DeliveryCalculator = ({ business, onDeliveryCalculated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);

  // Check if business has location-based delivery enabled
  const hasLocationDelivery = business?.business_latitude && business?.business_longitude;

  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation();
      setCustomerLocation(location);
      
      if (hasLocationDelivery) {
        const distance = calculateDistance(
          business.business_latitude,
          business.business_longitude,
          location.latitude,
          location.longitude
        );
        
        const roundedDistance = Math.round(distance * 100) / 100;
        const freeRadius = business.free_delivery_radius_km || 5;
        const maxRadius = business.max_delivery_radius_km;
        const chargeBeyond = business.delivery_charge_beyond_radius || 0;
        
        let deliveryCharge = 0;
        let isDeliverable = true;
        let message = '';
        
        // Check max radius
        if (maxRadius && roundedDistance > maxRadius) {
          isDeliverable = false;
          message = `Sorry, we don't deliver beyond ${maxRadius} km. You are ${formatDistance(roundedDistance)} away.`;
        } else if (roundedDistance <= freeRadius) {
          deliveryCharge = 0;
          message = `Free delivery! You are ${formatDistance(roundedDistance)} away.`;
        } else {
          deliveryCharge = chargeBeyond;
          message = `Delivery charge: ₹${chargeBeyond}. You are ${formatDistance(roundedDistance)} away.`;
        }
        
        const info = {
          distance: roundedDistance,
          deliveryCharge,
          isDeliverable,
          message,
          freeRadius
        };
        
        setDeliveryInfo(info);
        onDeliveryCalculated?.(info);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect on mount if browser allows
  useEffect(() => {
    // Check if we have permission hint
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          detectLocation();
        }
      });
    }
  }, []);

  if (!hasLocationDelivery) {
    // Show basic delivery info if no location-based delivery
    return (
      <div className="bg-gray-50 rounded-lg p-4" data-testid="delivery-info-basic">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Delivery Information</span>
        </div>
        {business?.delivery_charges > 0 ? (
          <p className="text-sm text-gray-600">
            Delivery charge: <span className="font-semibold">₹{business.delivery_charges}</span>
            {business?.min_order_for_free_delivery && (
              <span> (Free on orders above ₹{business.min_order_for_free_delivery})</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-green-600 font-medium">Free Delivery Available!</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4" data-testid="delivery-calculator">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="font-medium">Check Delivery to Your Location</span>
      </div>
      
      {!deliveryInfo && !loading && !error && (
        <Button
          onClick={detectLocation}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          data-testid="detect-location-btn"
        >
          <Navigation className="w-4 h-4" />
          Detect My Location
        </Button>
      )}
      
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Detecting your location...</span>
        </div>
      )}
      
      {error && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-600">
            <X className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button
            onClick={detectLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}
      
      {deliveryInfo && (
        <div className="space-y-2" data-testid="delivery-result">
          {deliveryInfo.isDeliverable ? (
            <div className={`flex items-center gap-2 ${deliveryInfo.deliveryCharge === 0 ? 'text-green-600' : 'text-blue-600'}`}>
              <Check className="w-5 h-5" />
              <span className="font-medium">{deliveryInfo.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              <span className="font-medium">{deliveryInfo.message}</span>
            </div>
          )}
          
          {deliveryInfo.isDeliverable && (
            <div className="text-xs text-muted-foreground mt-1">
              Free delivery within {deliveryInfo.freeRadius} km
            </div>
          )}
          
          <Button
            onClick={detectLocation}
            variant="ghost"
            size="sm"
            className="text-xs mt-2"
          >
            Update Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeliveryCalculator;
