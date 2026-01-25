"""
WAConnect API Tests - Backend API Testing
Tests: Auth, Business CRUD, Products, Bookings, Orders, Analytics
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"{TEST_PREFIX}user_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        self.test_name = f"{TEST_PREFIX}User"
    
    def test_signup_success(self):
        """Test user signup"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email
        assert data["user"]["name"] == self.test_name
        print(f"✓ Signup successful for {self.test_email}")
    
    def test_signup_duplicate_email(self):
        """Test signup with duplicate email fails"""
        # First signup
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password
        })
        # Second signup with same email
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password
        })
        assert response.status_code == 400
        print("✓ Duplicate email signup correctly rejected")
    
    def test_login_success(self):
        """Test user login"""
        # First signup
        requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password
        })
        # Then login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.test_email,
            "password": self.test_password
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email
        print("✓ Login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_me_authenticated(self):
        """Test /auth/me endpoint with valid token"""
        # Signup and get token
        signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_password
        })
        token = signup_response.json()["token"]
        
        # Get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.test_email
        print("✓ Get current user successful")
    
    def test_get_me_unauthenticated(self):
        """Test /auth/me endpoint without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated access correctly rejected")


class TestBusinessCRUD:
    """Business CRUD endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated user"""
        self.test_email = f"{TEST_PREFIX}biz_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        
        # Create user and get token
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"{TEST_PREFIX}Business Owner",
            "email": self.test_email,
            "password": self.test_password
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.subdomain = f"test{uuid.uuid4().hex[:8]}"
    
    def test_create_business(self):
        """Test business creation"""
        response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Test Business",
            "description": "A test business",
            "subdomain": self.subdomain,
            "whatsapp_number": "+919876543210",
            "category": "Restaurant",
            "template_type": "restaurant"
        }, headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == f"{TEST_PREFIX}Test Business"
        assert data["subdomain"] == self.subdomain
        assert "id" in data
        print(f"✓ Business created with subdomain: {self.subdomain}")
        return data
    
    def test_get_user_businesses(self):
        """Test getting user's businesses"""
        # Create a business first
        self.test_create_business()
        
        response = requests.get(f"{BASE_URL}/api/businesses", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Retrieved {len(data)} businesses")
    
    def test_get_business_by_id(self):
        """Test getting business by ID"""
        # Create a business first
        created = self.test_create_business()
        business_id = created["id"]
        
        response = requests.get(f"{BASE_URL}/api/businesses/{business_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == business_id
        print(f"✓ Retrieved business by ID: {business_id}")
    
    def test_update_business(self):
        """Test business update"""
        # Create a business first
        created = self.test_create_business()
        business_id = created["id"]
        
        response = requests.put(f"{BASE_URL}/api/businesses/{business_id}", json={
            "description": "Updated description"
        }, headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        print(f"✓ Business updated successfully")
    
    def test_get_public_business_by_subdomain(self):
        """Test public business access by subdomain"""
        # Create a business first
        self.test_create_business()
        
        response = requests.get(f"{BASE_URL}/api/public/businesses/{self.subdomain}")
        assert response.status_code == 200
        data = response.json()
        assert data["subdomain"] == self.subdomain
        print(f"✓ Public business access successful for subdomain: {self.subdomain}")
    
    def test_duplicate_subdomain_rejected(self):
        """Test duplicate subdomain is rejected"""
        # Create first business
        self.test_create_business()
        
        # Try to create another with same subdomain
        response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Another Business",
            "description": "Another test business",
            "subdomain": self.subdomain,
            "whatsapp_number": "+919876543211",
            "category": "Retail",
            "template_type": "retail"
        }, headers=self.headers)
        assert response.status_code == 400
        print("✓ Duplicate subdomain correctly rejected")


class TestProductCRUD:
    """Product CRUD endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated user and business"""
        self.test_email = f"{TEST_PREFIX}prod_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        
        # Create user and get token
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"{TEST_PREFIX}Product Owner",
            "email": self.test_email,
            "password": self.test_password
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create business
        subdomain = f"prod{uuid.uuid4().hex[:8]}"
        biz_response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Product Test Business",
            "description": "A test business for products",
            "subdomain": subdomain,
            "whatsapp_number": "+919876543210",
            "category": "Restaurant",
            "template_type": "restaurant"
        }, headers=self.headers)
        self.business_id = biz_response.json()["id"]
    
    def test_create_product(self):
        """Test product creation"""
        response = requests.post(f"{BASE_URL}/api/businesses/{self.business_id}/products", json={
            "name": f"{TEST_PREFIX}Test Product",
            "description": "A test product",
            "mrp": 100.0,
            "sale_price": 80.0,
            "category": "Food",
            "is_veg": True
        }, headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == f"{TEST_PREFIX}Test Product"
        assert data["mrp"] == 100.0
        assert data["sale_price"] == 80.0
        assert data["discount_percentage"] == 20.0
        print(f"✓ Product created with discount: {data['discount_percentage']}%")
        return data
    
    def test_get_business_products(self):
        """Test getting business products"""
        # Create a product first
        self.test_create_product()
        
        response = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Retrieved {len(data)} products")
    
    def test_update_product(self):
        """Test product update"""
        # Create a product first
        created = self.test_create_product()
        product_id = created["id"]
        
        response = requests.put(f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}", json={
            "sale_price": 70.0
        }, headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["sale_price"] == 70.0
        assert data["discount_percentage"] == 30.0  # Updated discount
        print(f"✓ Product updated with new discount: {data['discount_percentage']}%")
    
    def test_delete_product(self):
        """Test product deletion"""
        # Create a product first
        created = self.test_create_product()
        product_id = created["id"]
        
        response = requests.delete(f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}", headers=self.headers)
        assert response.status_code == 200
        
        # Verify deletion
        products = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/products").json()
        product_ids = [p["id"] for p in products]
        assert product_id not in product_ids
        print(f"✓ Product deleted successfully")


class TestBookings:
    """Booking endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated user and business"""
        self.test_email = f"{TEST_PREFIX}book_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        
        # Create user and get token
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"{TEST_PREFIX}Booking Owner",
            "email": self.test_email,
            "password": self.test_password
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create business
        subdomain = f"book{uuid.uuid4().hex[:8]}"
        biz_response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Booking Test Business",
            "description": "A test business for bookings",
            "subdomain": subdomain,
            "whatsapp_number": "+919876543210",
            "category": "Salon",
            "template_type": "salon"
        }, headers=self.headers)
        self.business_id = biz_response.json()["id"]
    
    def test_create_booking(self):
        """Test booking creation (public endpoint)"""
        response = requests.post(f"{BASE_URL}/api/businesses/{self.business_id}/bookings", json={
            "customer_name": f"{TEST_PREFIX}Customer",
            "customer_phone": "+919876543210",
            "customer_email": "customer@example.com",
            "service_type": "Haircut",
            "preferred_date": "2025-02-01",
            "preferred_time": "10:00",
            "notes": "Test booking"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["customer_name"] == f"{TEST_PREFIX}Customer"
        assert data["status"] == "pending"
        print(f"✓ Booking created successfully")
        return data
    
    def test_get_business_bookings(self):
        """Test getting business bookings (authenticated)"""
        # Create a booking first
        self.test_create_booking()
        
        response = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/bookings", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Retrieved {len(data)} bookings")


class TestOrders:
    """Order endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated user, business, and product"""
        self.test_email = f"{TEST_PREFIX}order_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        
        # Create user and get token
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"{TEST_PREFIX}Order Owner",
            "email": self.test_email,
            "password": self.test_password
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create business
        subdomain = f"order{uuid.uuid4().hex[:8]}"
        biz_response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Order Test Business",
            "description": "A test business for orders",
            "subdomain": subdomain,
            "whatsapp_number": "+919876543210",
            "category": "Restaurant",
            "template_type": "restaurant"
        }, headers=self.headers)
        self.business_id = biz_response.json()["id"]
        
        # Create product
        prod_response = requests.post(f"{BASE_URL}/api/businesses/{self.business_id}/products", json={
            "name": f"{TEST_PREFIX}Order Product",
            "description": "A test product for orders",
            "mrp": 100.0,
            "sale_price": 80.0
        }, headers=self.headers)
        self.product_id = prod_response.json()["id"]
    
    def test_create_order(self):
        """Test order creation (public endpoint)"""
        response = requests.post(f"{BASE_URL}/api/businesses/{self.business_id}/orders", json={
            "customer_name": f"{TEST_PREFIX}Order Customer",
            "customer_phone": "+919876543210",
            "customer_address": "123 Test Street",
            "items": [
                {"product_id": self.product_id, "quantity": 2}
            ],
            "notes": "Test order"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["customer_name"] == f"{TEST_PREFIX}Order Customer"
        assert data["total_amount"] == 160.0  # 80 * 2
        assert data["status"] == "pending"
        assert len(data["items"]) == 1
        print(f"✓ Order created with total: ₹{data['total_amount']}")
        return data
    
    def test_get_business_orders(self):
        """Test getting business orders (authenticated)"""
        # Create an order first
        self.test_create_order()
        
        response = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/orders", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Retrieved {len(data)} orders")


class TestAnalytics:
    """Analytics endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated user and business with data"""
        self.test_email = f"{TEST_PREFIX}analytics_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "testpass123"
        
        # Create user and get token
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"{TEST_PREFIX}Analytics Owner",
            "email": self.test_email,
            "password": self.test_password
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create business
        subdomain = f"analytics{uuid.uuid4().hex[:8]}"
        biz_response = requests.post(f"{BASE_URL}/api/businesses", json={
            "name": f"{TEST_PREFIX}Analytics Test Business",
            "description": "A test business for analytics",
            "subdomain": subdomain,
            "whatsapp_number": "+919876543210",
            "category": "Restaurant",
            "template_type": "restaurant"
        }, headers=self.headers)
        self.business_id = biz_response.json()["id"]
    
    def test_get_analytics(self):
        """Test analytics endpoint"""
        response = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/analytics", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "products_count" in data
        assert "total_bookings" in data
        assert "total_orders" in data
        assert "total_revenue" in data
        print(f"✓ Analytics retrieved: {data}")


class TestTemplates:
    """Templates endpoint tests"""
    
    def test_get_templates(self):
        """Test templates endpoint"""
        response = requests.get(f"{BASE_URL}/api/templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        print(f"✓ Templates retrieved: {len(data['templates'])} templates")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
