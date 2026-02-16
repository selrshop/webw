"""
Test Location-Based Delivery Feature
Tests for:
- Haversine distance calculation
- Delivery charge calculation API
- Business location settings
"""
import pytest
import requests
import os
import math

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test business subdomain with location configured
TEST_SUBDOMAIN = "demofashion"

# Mumbai business location (configured in demofashion)
BUSINESS_LAT = 19.07609
BUSINESS_LON = 72.877426

class TestDeliveryCalculationAPI:
    """Test the delivery calculation endpoint"""
    
    def test_delivery_within_free_radius(self):
        """Test delivery within 5km free radius - should be free"""
        # Location ~0.5km from business
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": 19.08,
                "customer_longitude": 72.88
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "distance_km" in data
        assert "delivery_charge" in data
        assert "is_deliverable" in data
        assert "free_delivery_radius_km" in data
        assert "message" in data
        
        # Verify free delivery within radius
        assert data["is_deliverable"] == True
        assert data["delivery_charge"] == 0.0
        assert data["distance_km"] < 5.0
        assert "Free delivery" in data["message"]
        print(f"✓ Within free radius: {data['distance_km']} km - FREE delivery")
    
    def test_delivery_beyond_free_radius_within_max(self):
        """Test delivery beyond 5km but within 15km max - should charge ₹50"""
        # Location ~11km from business
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": 19.15,
                "customer_longitude": 72.95
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify charged delivery
        assert data["is_deliverable"] == True
        assert data["delivery_charge"] == 50.0
        assert data["distance_km"] > 5.0
        assert data["distance_km"] < 15.0
        assert "₹50" in data["message"] or "50.0" in data["message"]
        print(f"✓ Beyond free radius: {data['distance_km']} km - ₹{data['delivery_charge']} charge")
    
    def test_delivery_beyond_max_radius(self):
        """Test delivery beyond 15km max radius - should not be deliverable"""
        # Location ~34km from business
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": 19.3,
                "customer_longitude": 73.1
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify not deliverable
        assert data["is_deliverable"] == False
        assert data["distance_km"] > 15.0
        assert "don't deliver" in data["message"].lower() or "beyond" in data["message"].lower()
        print(f"✓ Beyond max radius: {data['distance_km']} km - NOT deliverable")
    
    def test_delivery_exact_boundary_free_radius(self):
        """Test delivery at exactly 5km boundary"""
        # Calculate coordinates approximately 5km away
        # Using rough approximation: 1 degree lat ≈ 111km
        lat_offset = 5 / 111  # ~0.045 degrees
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": BUSINESS_LAT + lat_offset,
                "customer_longitude": BUSINESS_LON
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # At boundary, should be within free radius (<=5km)
        assert data["is_deliverable"] == True
        print(f"✓ At ~5km boundary: {data['distance_km']} km - deliverable: {data['is_deliverable']}")
    
    def test_delivery_invalid_business(self):
        """Test delivery calculation for non-existent business"""
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/nonexistent-business-xyz/calculate-delivery",
            json={
                "customer_latitude": 19.08,
                "customer_longitude": 72.88
            }
        )
        assert response.status_code == 404
        print("✓ Non-existent business returns 404")
    
    def test_delivery_missing_coordinates(self):
        """Test delivery calculation with missing coordinates"""
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": 19.08
                # Missing longitude
            }
        )
        assert response.status_code == 422  # Validation error
        print("✓ Missing coordinates returns 422 validation error")


class TestBusinessLocationSettings:
    """Test business location settings via API"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "demo@test.com",
                "password": "demo123"
            }
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_business_has_location_fields(self, auth_token):
        """Verify business has location-based delivery fields"""
        response = requests.get(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify location fields exist
        assert "business_latitude" in data
        assert "business_longitude" in data
        assert "free_delivery_radius_km" in data
        assert "delivery_charge_beyond_radius" in data
        assert "max_delivery_radius_km" in data
        
        # Verify values are set correctly for demofashion
        assert data["business_latitude"] == 19.07609
        assert data["business_longitude"] == 72.877426
        assert data["free_delivery_radius_km"] == 5.0
        assert data["delivery_charge_beyond_radius"] == 50.0
        assert data["max_delivery_radius_km"] == 15.0
        
        print(f"✓ Business location: ({data['business_latitude']}, {data['business_longitude']})")
        print(f"✓ Free radius: {data['free_delivery_radius_km']} km")
        print(f"✓ Charge beyond: ₹{data['delivery_charge_beyond_radius']}")
        print(f"✓ Max radius: {data['max_delivery_radius_km']} km")


class TestHaversineDistanceCalculation:
    """Test distance calculation accuracy"""
    
    def test_distance_calculation_accuracy(self):
        """Verify Haversine formula gives accurate distances"""
        # Test known distance: Mumbai to Pune is approximately 150km
        mumbai_lat, mumbai_lon = 19.0760, 72.8777
        pune_lat, pune_lon = 18.5204, 73.8567
        
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": pune_lat,
                "customer_longitude": pune_lon
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Distance should be approximately 120-150km
        assert 100 < data["distance_km"] < 200
        print(f"✓ Mumbai to Pune distance: {data['distance_km']} km (expected ~120-150km)")
    
    def test_same_location_zero_distance(self):
        """Test that same location returns ~0 distance"""
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": BUSINESS_LAT,
                "customer_longitude": BUSINESS_LON
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Distance should be 0 or very close to 0
        assert data["distance_km"] < 0.1
        assert data["delivery_charge"] == 0.0
        assert data["is_deliverable"] == True
        print(f"✓ Same location distance: {data['distance_km']} km")


class TestDeliveryRulesPreview:
    """Test delivery rules are correctly returned"""
    
    def test_delivery_rules_in_response(self):
        """Verify delivery rules are included in response"""
        response = requests.post(
            f"{BASE_URL}/api/public/businesses/{TEST_SUBDOMAIN}/calculate-delivery",
            json={
                "customer_latitude": 19.08,
                "customer_longitude": 72.88
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify free_delivery_radius_km is returned
        assert data["free_delivery_radius_km"] == 5.0
        print(f"✓ Free delivery radius returned: {data['free_delivery_radius_km']} km")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
