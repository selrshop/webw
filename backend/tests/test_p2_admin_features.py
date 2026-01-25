"""
P2 Admin Features Backend Tests
Tests for:
1. Dynamic product attributes (veg/non-veg, sizes, colors)
2. Business settings (delivery charges, taxes, color scheme)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "demo@test.com"
TEST_PASSWORD = "demo123"

class TestProductAttributes:
    """Tests for dynamic product attributes - veg/non-veg, sizes, colors"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data["token"]
        self.user_id = data["user"]["id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get business
        biz_response = requests.get(f"{BASE_URL}/api/businesses", headers=self.headers)
        assert biz_response.status_code == 200
        businesses = biz_response.json()
        assert len(businesses) > 0, "No businesses found"
        self.business_id = businesses[0]["id"]
    
    def test_get_products_with_attributes(self):
        """Test that products return is_veg, sizes, colors fields"""
        response = requests.get(f"{BASE_URL}/api/businesses/{self.business_id}/products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) >= 2, "Expected at least 2 products"
        
        # Find clothing product (Classic T-Shirt)
        clothing_product = next((p for p in products if p["product_type"] == "clothing"), None)
        assert clothing_product is not None, "Clothing product not found"
        assert "sizes" in clothing_product, "sizes field missing"
        assert "colors" in clothing_product, "colors field missing"
        assert len(clothing_product["sizes"]) > 0, "Clothing product should have sizes"
        assert len(clothing_product["colors"]) > 0, "Clothing product should have colors"
        print(f"Clothing product sizes: {clothing_product['sizes']}")
        print(f"Clothing product colors: {clothing_product['colors']}")
        
        # Find food product (Paneer Butter Masala)
        food_product = next((p for p in products if p["product_type"] == "food"), None)
        assert food_product is not None, "Food product not found"
        assert "is_veg" in food_product, "is_veg field missing"
        assert food_product["is_veg"] == True, "Paneer Butter Masala should be vegetarian"
        print(f"Food product is_veg: {food_product['is_veg']}")
    
    def test_create_food_product_with_veg_attribute(self):
        """Test creating a food product with is_veg attribute"""
        product_data = {
            "name": "TEST_Chicken Biryani",
            "description": "Spicy chicken biryani",
            "mrp": 350.0,
            "sale_price": 299.0,
            "category": "Main Course",
            "product_type": "food",
            "is_veg": False,
            "is_available": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert response.status_code == 200, f"Create product failed: {response.text}"
        
        created = response.json()
        assert created["is_veg"] == False, "is_veg should be False for non-veg item"
        assert created["product_type"] == "food"
        print(f"Created non-veg food product: {created['name']}, is_veg={created['is_veg']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{created['id']}",
            headers=self.headers
        )
    
    def test_create_clothing_product_with_sizes_colors(self):
        """Test creating a clothing product with sizes and colors"""
        product_data = {
            "name": "TEST_Denim Jeans",
            "description": "Classic blue denim jeans",
            "mrp": 1999.0,
            "sale_price": 1499.0,
            "category": "Jeans",
            "product_type": "clothing",
            "sizes": ["28", "30", "32", "34", "36"],
            "colors": ["Blue", "Black", "Grey"],
            "is_available": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert response.status_code == 200, f"Create product failed: {response.text}"
        
        created = response.json()
        assert created["sizes"] == ["28", "30", "32", "34", "36"], "Sizes not saved correctly"
        assert created["colors"] == ["Blue", "Black", "Grey"], "Colors not saved correctly"
        assert created["product_type"] == "clothing"
        print(f"Created clothing product: {created['name']}, sizes={created['sizes']}, colors={created['colors']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{created['id']}",
            headers=self.headers
        )
    
    def test_update_product_veg_attribute(self):
        """Test updating is_veg attribute on a product"""
        # Create a test product
        product_data = {
            "name": "TEST_Veg Pulao",
            "description": "Vegetable pulao",
            "mrp": 199.0,
            "sale_price": 149.0,
            "product_type": "food",
            "is_veg": True,
            "is_available": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        
        # Update to non-veg
        update_response = requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}",
            json={"is_veg": False},
            headers=self.headers
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["is_veg"] == False, "is_veg should be updated to False"
        print(f"Updated product is_veg from True to {updated['is_veg']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}",
            headers=self.headers
        )
    
    def test_update_product_sizes_colors(self):
        """Test updating sizes and colors on a product"""
        # Create a test product
        product_data = {
            "name": "TEST_Polo Shirt",
            "description": "Cotton polo shirt",
            "mrp": 799.0,
            "sale_price": 599.0,
            "product_type": "clothing",
            "sizes": ["S", "M"],
            "colors": ["White"],
            "is_available": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        
        # Update sizes and colors
        update_response = requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}",
            json={
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "colors": ["White", "Navy", "Red"]
            },
            headers=self.headers
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["sizes"] == ["S", "M", "L", "XL", "XXL"], "Sizes not updated correctly"
        assert updated["colors"] == ["White", "Navy", "Red"], "Colors not updated correctly"
        print(f"Updated product sizes={updated['sizes']}, colors={updated['colors']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{product_id}",
            headers=self.headers
        )


class TestBusinessSettings:
    """Tests for business settings - delivery charges, taxes, color scheme"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get business
        biz_response = requests.get(f"{BASE_URL}/api/businesses", headers=self.headers)
        assert biz_response.status_code == 200
        businesses = biz_response.json()
        assert len(businesses) > 0, "No businesses found"
        self.business = businesses[0]
        self.business_id = self.business["id"]
    
    def test_get_business_has_delivery_tax_color_fields(self):
        """Test that business response includes delivery, tax, and color fields"""
        response = requests.get(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        business = response.json()
        
        # Check delivery fields
        assert "delivery_charges" in business, "delivery_charges field missing"
        assert "min_order_for_free_delivery" in business, "min_order_for_free_delivery field missing"
        
        # Check tax field
        assert "tax_percentage" in business, "tax_percentage field missing"
        
        # Check color fields
        assert "primary_color" in business, "primary_color field missing"
        assert "secondary_color" in business, "secondary_color field missing"
        assert "accent_color" in business, "accent_color field missing"
        
        print(f"Business settings: delivery_charges={business['delivery_charges']}, "
              f"tax_percentage={business['tax_percentage']}, "
              f"primary_color={business['primary_color']}")
    
    def test_update_delivery_charges(self):
        """Test updating delivery charges"""
        update_data = {
            "delivery_charges": 50.0,
            "min_order_for_free_delivery": 500.0
        }
        
        response = requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json=update_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated["delivery_charges"] == 50.0, "delivery_charges not updated"
        assert updated["min_order_for_free_delivery"] == 500.0, "min_order_for_free_delivery not updated"
        print(f"Updated delivery_charges={updated['delivery_charges']}, "
              f"min_order_for_free_delivery={updated['min_order_for_free_delivery']}")
        
        # Reset to original
        requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json={"delivery_charges": 0.0, "min_order_for_free_delivery": None},
            headers=self.headers
        )
    
    def test_update_tax_percentage(self):
        """Test updating tax percentage"""
        update_data = {"tax_percentage": 18.0}
        
        response = requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json=update_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated["tax_percentage"] == 18.0, "tax_percentage not updated"
        print(f"Updated tax_percentage={updated['tax_percentage']}")
        
        # Reset to original
        requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json={"tax_percentage": 0.0},
            headers=self.headers
        )
    
    def test_update_color_scheme(self):
        """Test updating color scheme"""
        # Store original colors
        original_primary = self.business.get("primary_color", "#2563eb")
        original_secondary = self.business.get("secondary_color", "#3b82f6")
        original_accent = self.business.get("accent_color", "#60a5fa")
        
        # Update to new colors (Green theme)
        update_data = {
            "primary_color": "#16a34a",
            "secondary_color": "#22c55e",
            "accent_color": "#4ade80"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json=update_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated["primary_color"] == "#16a34a", "primary_color not updated"
        assert updated["secondary_color"] == "#22c55e", "secondary_color not updated"
        assert updated["accent_color"] == "#4ade80", "accent_color not updated"
        print(f"Updated colors: primary={updated['primary_color']}, "
              f"secondary={updated['secondary_color']}, accent={updated['accent_color']}")
        
        # Verify via GET
        get_response = requests.get(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            headers=self.headers
        )
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["primary_color"] == "#16a34a", "Color not persisted"
        
        # Reset to original
        requests.put(
            f"{BASE_URL}/api/businesses/{self.business_id}",
            json={
                "primary_color": original_primary,
                "secondary_color": original_secondary,
                "accent_color": original_accent
            },
            headers=self.headers
        )
    
    def test_public_business_endpoint_returns_colors(self):
        """Test that public business endpoint returns color scheme"""
        response = requests.get(f"{BASE_URL}/api/public/businesses/demofashion")
        assert response.status_code == 200
        
        business = response.json()
        assert "primary_color" in business, "primary_color missing from public endpoint"
        assert "secondary_color" in business, "secondary_color missing from public endpoint"
        assert "accent_color" in business, "accent_color missing from public endpoint"
        print(f"Public endpoint colors: primary={business['primary_color']}")


class TestProductTypeValidation:
    """Tests for product type specific attribute validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        self.token = data["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get business
        biz_response = requests.get(f"{BASE_URL}/api/businesses", headers=self.headers)
        businesses = biz_response.json()
        self.business_id = businesses[0]["id"]
    
    def test_grocery_product_with_veg_attribute(self):
        """Test that grocery products can have is_veg attribute"""
        product_data = {
            "name": "TEST_Organic Rice",
            "description": "Premium basmati rice",
            "mrp": 150.0,
            "sale_price": 120.0,
            "product_type": "grocery",
            "is_veg": True,
            "is_available": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        created = response.json()
        assert created["product_type"] == "grocery"
        assert created["is_veg"] == True
        print(f"Created grocery product with is_veg={created['is_veg']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{created['id']}",
            headers=self.headers
        )
    
    def test_electronics_product_with_colors(self):
        """Test that electronics products can have colors"""
        product_data = {
            "name": "TEST_Wireless Earbuds",
            "description": "Bluetooth earbuds with noise cancellation",
            "mrp": 2999.0,
            "sale_price": 1999.0,
            "product_type": "electronics",
            "colors": ["Black", "White", "Blue"],
            "is_available": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/businesses/{self.business_id}/products",
            json=product_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        created = response.json()
        assert created["product_type"] == "electronics"
        assert created["colors"] == ["Black", "White", "Blue"]
        print(f"Created electronics product with colors={created['colors']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/businesses/{self.business_id}/products/{created['id']}",
            headers=self.headers
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
