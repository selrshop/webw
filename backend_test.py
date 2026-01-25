import requests
import sys
import json
from datetime import datetime

class WAConnectAPITester:
    def __init__(self, base_url="https://wabizsite.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.business_id = None
        self.product_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/health",
            200
        )
        return success

    def test_signup(self):
        """Test user signup"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "/auth/signup",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # Use the same credentials from signup
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/auth/me",
            200
        )
        return success

    def test_create_business(self):
        """Test business creation"""
        timestamp = datetime.now().strftime('%H%M%S')
        business_data = {
            "name": f"Test Business {timestamp}",
            "description": "A test business for API testing",
            "subdomain": f"testbiz{timestamp}",
            "whatsapp_number": "919876543210",
            "category": "Restaurant",
            "address": "Test Address, Mumbai",
            "business_hours": "9 AM - 9 PM"
        }
        
        success, response = self.run_test(
            "Create Business",
            "POST",
            "/businesses",
            200,
            data=business_data
        )
        
        if success and 'id' in response:
            self.business_id = response['id']
            return True
        return False

    def test_get_businesses(self):
        """Test get user businesses"""
        success, response = self.run_test(
            "Get User Businesses",
            "GET",
            "/businesses",
            200
        )
        return success

    def test_get_business_by_id(self):
        """Test get business by ID"""
        if not self.business_id:
            self.log_test("Get Business by ID", False, "No business ID available")
            return False
            
        success, response = self.run_test(
            "Get Business by ID",
            "GET",
            f"/businesses/{self.business_id}",
            200
        )
        return success

    def test_update_business(self):
        """Test business update"""
        if not self.business_id:
            self.log_test("Update Business", False, "No business ID available")
            return False
            
        update_data = {
            "description": "Updated test business description",
            "business_hours": "8 AM - 10 PM"
        }
        
        success, response = self.run_test(
            "Update Business",
            "PUT",
            f"/businesses/{self.business_id}",
            200,
            data=update_data
        )
        return success

    def test_get_business_by_subdomain(self):
        """Test public business endpoint"""
        if not self.business_id:
            self.log_test("Get Business by Subdomain", False, "No business ID available")
            return False
            
        # We need to get the subdomain first
        success, business = self.run_test(
            "Get Business for Subdomain Test",
            "GET",
            f"/businesses/{self.business_id}",
            200
        )
        
        if success and 'subdomain' in business:
            subdomain = business['subdomain']
            success, response = self.run_test(
                "Get Business by Subdomain (Public)",
                "GET",
                f"/public/businesses/{subdomain}",
                200
            )
            return success
        return False

    def test_create_product(self):
        """Test product creation"""
        if not self.business_id:
            self.log_test("Create Product", False, "No business ID available")
            return False
            
        product_data = {
            "name": "Test Product",
            "description": "A test product for API testing",
            "price": 99.99,
            "category": "Food",
            "is_available": True
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            f"/businesses/{self.business_id}/products",
            200,
            data=product_data
        )
        
        if success and 'id' in response:
            self.product_id = response['id']
            return True
        return False

    def test_get_products(self):
        """Test get business products"""
        if not self.business_id:
            self.log_test("Get Products", False, "No business ID available")
            return False
            
        success, response = self.run_test(
            "Get Business Products",
            "GET",
            f"/businesses/{self.business_id}/products",
            200
        )
        return success

    def test_update_product(self):
        """Test product update"""
        if not self.business_id or not self.product_id:
            self.log_test("Update Product", False, "No business or product ID available")
            return False
            
        update_data = {
            "name": "Updated Test Product",
            "price": 149.99
        }
        
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"/businesses/{self.business_id}/products/{self.product_id}",
            200,
            data=update_data
        )
        return success

    def test_create_booking(self):
        """Test booking creation (public endpoint)"""
        if not self.business_id:
            self.log_test("Create Booking", False, "No business ID available")
            return False
            
        booking_data = {
            "customer_name": "Test Customer",
            "customer_phone": "919876543210",
            "customer_email": "customer@example.com",
            "service_type": "Consultation",
            "preferred_date": "2025-01-20",
            "preferred_time": "14:00",
            "notes": "Test booking"
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            f"/businesses/{self.business_id}/bookings",
            200,
            data=booking_data
        )
        return success

    def test_get_bookings(self):
        """Test get business bookings"""
        if not self.business_id:
            self.log_test("Get Bookings", False, "No business ID available")
            return False
            
        success, response = self.run_test(
            "Get Business Bookings",
            "GET",
            f"/businesses/{self.business_id}/bookings",
            200
        )
        return success

    def test_create_order(self):
        """Test order creation"""
        if not self.business_id or not self.product_id:
            self.log_test("Create Order", False, "No business or product ID available")
            return False
            
        order_data = {
            "customer_name": "Test Customer",
            "customer_phone": "919876543210",
            "customer_address": "Test Address, Mumbai",
            "items": [
                {
                    "product_id": self.product_id,
                    "quantity": 2
                }
            ],
            "notes": "Test order"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            f"/businesses/{self.business_id}/orders",
            200,
            data=order_data
        )
        return success

    def test_get_orders(self):
        """Test get business orders"""
        if not self.business_id:
            self.log_test("Get Orders", False, "No business ID available")
            return False
            
        success, response = self.run_test(
            "Get Business Orders",
            "GET",
            f"/businesses/{self.business_id}/orders",
            200
        )
        return success

    def test_get_analytics(self):
        """Test business analytics"""
        if not self.business_id:
            self.log_test("Get Analytics", False, "No business ID available")
            return False
            
        success, response = self.run_test(
            "Get Business Analytics",
            "GET",
            f"/businesses/{self.business_id}/analytics",
            200
        )
        return success

    def test_delete_product(self):
        """Test product deletion"""
        if not self.business_id or not self.product_id:
            self.log_test("Delete Product", False, "No business or product ID available")
            return False
            
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"/businesses/{self.business_id}/products/{self.product_id}",
            200
        )
        return success

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting WAConnect API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Health check
        self.test_health_check()
        
        # Authentication tests
        if self.test_signup():
            self.test_get_me()
        
        # Business tests
        if self.test_create_business():
            self.test_get_businesses()
            self.test_get_business_by_id()
            self.test_update_business()
            self.test_get_business_by_subdomain()
            
            # Product tests
            if self.test_create_product():
                self.test_get_products()
                self.test_update_product()
                
                # Order tests (requires product)
                self.test_create_order()
                self.test_get_orders()
                
                # Clean up - delete product
                self.test_delete_product()
            
            # Booking tests
            self.test_create_booking()
            self.test_get_bookings()
            
            # Analytics tests
            self.test_get_analytics()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = WAConnectAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())