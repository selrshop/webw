from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from templates_config import BUSINESS_TEMPLATES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ============ Auth Helper Functions ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = verify_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ============ Health Check Route ============

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "WAConnect API is running"}

@api_router.get("/templates")
async def get_templates():
    return {"templates": BUSINESS_TEMPLATES}

# ============ Pydantic Models ============

# User Models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "business_owner"  # super_admin, reseller, business_owner

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    role: str = "business_owner"  # super_admin, reseller, business_owner
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuthResponse(BaseModel):
    token: str
    user: User

# Business Models
class SocialMediaLinks(BaseModel):
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    pinterest: Optional[str] = None

class Review(BaseModel):
    customer_name: str
    rating: int
    comment: str
    date: str

class BusinessCreate(BaseModel):
    name: str
    description: str
    subdomain: str
    whatsapp_number: str
    category: str
    template_type: str  # restaurant, salon, retail, grocery, clinic, services, etc.
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = []
    youtube_video_url: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    business_hours: Optional[str] = None
    location_map_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    social_media_links: Optional[SocialMediaLinks] = None
    whatsapp_api_enabled: bool = False
    whatsapp_api_key: Optional[str] = None
    delivery_charges: Optional[float] = 0.0
    tax_percentage: Optional[float] = 0.0
    min_order_for_free_delivery: Optional[float] = None
    primary_color: Optional[str] = "#2563eb"  # Default blue
    secondary_color: Optional[str] = "#3b82f6"  # Lighter blue
    accent_color: Optional[str] = "#60a5fa"  # Accent
    # Location-based delivery
    business_latitude: Optional[float] = None
    business_longitude: Optional[float] = None
    free_delivery_radius_km: Optional[float] = 5.0  # Free delivery within this radius
    delivery_charge_beyond_radius: Optional[float] = 0.0  # Charge if beyond radius
    max_delivery_radius_km: Optional[float] = None  # Maximum delivery distance (optional)
    # Payment Gateway Configuration
    payment_gateway: Optional[str] = None  # razorpay, stripe, payu, phonepe
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    payu_merchant_key: Optional[str] = None
    payu_merchant_salt: Optional[str] = None
    phonepe_merchant_id: Optional[str] = None
    phonepe_salt_key: Optional[str] = None
    phonepe_salt_index: Optional[int] = None

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    whatsapp_number: Optional[str] = None
    category: Optional[str] = None
    template_type: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    youtube_video_url: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    business_hours: Optional[str] = None
    location_map_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    social_media_links: Optional[SocialMediaLinks] = None
    whatsapp_api_enabled: Optional[bool] = None
    whatsapp_api_key: Optional[str] = None
    delivery_charges: Optional[float] = None
    tax_percentage: Optional[float] = None
    min_order_for_free_delivery: Optional[float] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    # Location-based delivery
    business_latitude: Optional[float] = None
    business_longitude: Optional[float] = None
    free_delivery_radius_km: Optional[float] = None
    delivery_charge_beyond_radius: Optional[float] = None
    max_delivery_radius_km: Optional[float] = None
    # Payment Gateway Configuration
    payment_gateway: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    payu_merchant_key: Optional[str] = None
    payu_merchant_salt: Optional[str] = None
    phonepe_merchant_id: Optional[str] = None
    phonepe_salt_key: Optional[str] = None
    phonepe_salt_index: Optional[int] = None
    mobile_number: Optional[str] = None
    business_hours: Optional[str] = None
    location_map_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    social_media_links: Optional[SocialMediaLinks] = None
    whatsapp_api_enabled: Optional[bool] = None
    whatsapp_api_key: Optional[str] = None
    delivery_charges: Optional[float] = None
    tax_percentage: Optional[float] = None
    min_order_for_free_delivery: Optional[float] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    # Location-based delivery
    business_latitude: Optional[float] = None
    business_longitude: Optional[float] = None
    free_delivery_radius_km: Optional[float] = None
    delivery_charge_beyond_radius: Optional[float] = None
    max_delivery_radius_km: Optional[float] = None

class Business(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str
    subdomain: str
    whatsapp_number: str
    category: str
    template_type: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: List[str] = []
    youtube_video_url: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    business_hours: Optional[str] = None
    location_map_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    social_media_links: Optional[SocialMediaLinks] = None
    reviews: List[Review] = []
    whatsapp_api_enabled: bool = False
    whatsapp_api_key: Optional[str] = None
    delivery_charges: float = 0.0
    tax_percentage: float = 0.0
    min_order_for_free_delivery: Optional[float] = None
    primary_color: str = "#2563eb"
    secondary_color: str = "#3b82f6"
    accent_color: str = "#60a5fa"
    # Location-based delivery
    business_latitude: Optional[float] = None
    business_longitude: Optional[float] = None
    free_delivery_radius_km: float = 5.0
    delivery_charge_beyond_radius: float = 0.0
    max_delivery_radius_km: Optional[float] = None
    # Payment Gateway Configuration
    payment_gateway: Optional[str] = None  # razorpay, stripe, payu, phonepe
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    payu_merchant_key: Optional[str] = None
    payu_merchant_salt: Optional[str] = None
    phonepe_merchant_id: Optional[str] = None
    phonepe_salt_key: Optional[str] = None
    phonepe_salt_index: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

# Product Models
class BulkPricing(BaseModel):
    min_quantity: int
    price_per_unit: float

class ProductVariant(BaseModel):
    name: str  # e.g., "Small", "Medium", "Red", "Blue"
    price_adjustment: float = 0.0  # Additional price for this variant
    
class ProductCreate(BaseModel):
    name: str
    description: str
    mrp: float
    sale_price: float
    bulk_pricing: Optional[List[BulkPricing]] = []
    image_url: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = "general"  # food, clothing, grocery, service, etc.
    is_veg: Optional[bool] = None  # For food items
    sizes: Optional[List[str]] = []  # For clothing/products: ["S", "M", "L", "XL"]
    colors: Optional[List[str]] = []  # For products: ["Red", "Blue", "Green"]
    variants: Optional[List[ProductVariant]] = []  # Generic variants
    stock_quantity: Optional[int] = None  # For inventory
    is_available: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mrp: Optional[float] = None
    sale_price: Optional[float] = None
    bulk_pricing: Optional[List[BulkPricing]] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = None
    is_veg: Optional[bool] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    variants: Optional[List[ProductVariant]] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_id: str
    name: str
    description: str
    mrp: float
    sale_price: float
    discount_percentage: float = 0.0
    bulk_pricing: List[BulkPricing] = []
    image_url: Optional[str] = None
    category: Optional[str] = None
    product_type: str = "general"
    is_veg: Optional[bool] = None
    sizes: List[str] = []
    colors: List[str] = []
    variants: List[ProductVariant] = []
    stock_quantity: Optional[int] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Booking Models
class BookingCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    service_type: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    service_type: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Order Models
class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    mrp: float
    sale_price: float
    discount_percentage: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_id: str
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ Auth Routes ============

@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(user_data: UserSignup):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(name=user_data.name, email=user_data.email)
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_token(user.id, user.email)
    
    return AuthResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create user object without password
    user_doc.pop('password', None)
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    user = User(**user_doc)
    
    # Create token
    token = create_token(user.id, user.email)
    
    return AuthResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop('password', None)
    if isinstance(current_user['created_at'], str):
        current_user['created_at'] = datetime.fromisoformat(current_user['created_at'])
    return User(**current_user)

# ============ Business Routes ============

@api_router.post("/businesses", response_model=Business)
async def create_business(business_data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    # Check subdomain availability
    existing = await db.businesses.find_one({"subdomain": business_data.subdomain}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain already taken")
    
    business = Business(user_id=current_user['id'], **business_data.model_dump())
    business_dict = business.model_dump()
    business_dict['created_at'] = business_dict['created_at'].isoformat()
    
    await db.businesses.insert_one(business_dict)
    return business

@api_router.get("/businesses", response_model=List[Business])
async def get_user_businesses(current_user: dict = Depends(get_current_user)):
    businesses = await db.businesses.find({"user_id": current_user['id']}, {"_id": 0}).to_list(100)
    for biz in businesses:
        if isinstance(biz['created_at'], str):
            biz['created_at'] = datetime.fromisoformat(biz['created_at'])
    return businesses

@api_router.get("/businesses/{business_id}", response_model=Business)
async def get_business(business_id: str, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if isinstance(business['created_at'], str):
        business['created_at'] = datetime.fromisoformat(business['created_at'])
    return business

@api_router.put("/businesses/{business_id}", response_model=Business)
async def update_business(business_id: str, update_data: BusinessUpdate, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.businesses.update_one({"id": business_id}, {"$set": update_dict})
    
    updated_business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if isinstance(updated_business['created_at'], str):
        updated_business['created_at'] = datetime.fromisoformat(updated_business['created_at'])
    return updated_business

@api_router.get("/public/businesses/{subdomain}", response_model=Business)
async def get_business_by_subdomain(subdomain: str):
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if isinstance(business['created_at'], str):
        business['created_at'] = datetime.fromisoformat(business['created_at'])
    return business

# ============ Delivery Charge Calculation ============

import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the distance between two points on Earth using Haversine formula (in km)"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

class DeliveryChargeRequest(BaseModel):
    customer_latitude: float
    customer_longitude: float

class DeliveryChargeResponse(BaseModel):
    distance_km: float
    delivery_charge: float
    is_deliverable: bool
    free_delivery_radius_km: float
    message: str

@api_router.post("/public/businesses/{subdomain}/calculate-delivery", response_model=DeliveryChargeResponse)
async def calculate_delivery_charge(subdomain: str, location: DeliveryChargeRequest):
    """Calculate delivery charge based on customer location"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Check if business has location set
    if not business.get('business_latitude') or not business.get('business_longitude'):
        # Return default delivery charge if no location set
        return DeliveryChargeResponse(
            distance_km=0,
            delivery_charge=business.get('delivery_charges', 0),
            is_deliverable=True,
            free_delivery_radius_km=business.get('free_delivery_radius_km', 5.0),
            message="Business location not configured. Standard delivery charges apply."
        )
    
    # Calculate distance
    distance = haversine_distance(
        business['business_latitude'],
        business['business_longitude'],
        location.customer_latitude,
        location.customer_longitude
    )
    distance = round(distance, 2)
    
    free_radius = business.get('free_delivery_radius_km', 5.0)
    max_radius = business.get('max_delivery_radius_km')
    charge_beyond = business.get('delivery_charge_beyond_radius', 0)
    
    # Check if within max delivery radius
    if max_radius and distance > max_radius:
        return DeliveryChargeResponse(
            distance_km=distance,
            delivery_charge=0,
            is_deliverable=False,
            free_delivery_radius_km=free_radius,
            message=f"Sorry, we don't deliver beyond {max_radius} km. Your location is {distance} km away."
        )
    
    # Calculate delivery charge
    if distance <= free_radius:
        return DeliveryChargeResponse(
            distance_km=distance,
            delivery_charge=0,
            is_deliverable=True,
            free_delivery_radius_km=free_radius,
            message=f"Free delivery! You are {distance} km away (within {free_radius} km free delivery zone)."
        )
    else:
        return DeliveryChargeResponse(
            distance_km=distance,
            delivery_charge=charge_beyond,
            is_deliverable=True,
            free_delivery_radius_km=free_radius,
            message=f"Delivery charge: ₹{charge_beyond}. You are {distance} km away (beyond {free_radius} km free delivery zone)."
        )

# ============ Product Routes ============

@api_router.post("/businesses/{business_id}/products", response_model=Product)
async def create_product(business_id: str, product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Calculate discount percentage
    discount_pct = 0.0
    if product_data.mrp > 0 and product_data.sale_price < product_data.mrp:
        discount_pct = round(((product_data.mrp - product_data.sale_price) / product_data.mrp) * 100, 2)
    
    product = Product(
        business_id=business_id, 
        discount_percentage=discount_pct,
        **product_data.model_dump()
    )
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    
    await db.products.insert_one(product_dict)
    return product

@api_router.get("/businesses/{business_id}/products", response_model=List[Product])
async def get_business_products(business_id: str):
    products = await db.products.find({"business_id": business_id}, {"_id": 0}).to_list(500)
    for prod in products:
        if isinstance(prod['created_at'], str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.put("/businesses/{business_id}/products/{product_id}", response_model=Product)
async def update_product(business_id: str, product_id: str, update_data: ProductUpdate, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    product = await db.products.find_one({"id": product_id, "business_id": business_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    # Recalculate discount if MRP or sale price changed
    if 'mrp' in update_dict or 'sale_price' in update_dict:
        mrp = update_dict.get('mrp', product.get('mrp', 0))
        sale_price = update_dict.get('sale_price', product.get('sale_price', 0))
        if mrp > 0 and sale_price < mrp:
            update_dict['discount_percentage'] = round(((mrp - sale_price) / mrp) * 100, 2)
        else:
            update_dict['discount_percentage'] = 0.0
    
    if update_dict:
        await db.products.update_one({"id": product_id}, {"$set": update_dict})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product['created_at'], str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    return updated_product

@api_router.delete("/businesses/{business_id}/products/{product_id}")
async def delete_product(business_id: str, product_id: str, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = await db.products.delete_one({"id": product_id, "business_id": business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ============ Booking Routes ============

@api_router.post("/businesses/{business_id}/bookings", response_model=Booking)
async def create_booking(business_id: str, booking_data: BookingCreate):
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    booking = Booking(business_id=business_id, **booking_data.model_dump())
    booking_dict = booking.model_dump()
    booking_dict['created_at'] = booking_dict['created_at'].isoformat()
    
    await db.bookings.insert_one(booking_dict)
    return booking

@api_router.get("/businesses/{business_id}/bookings", response_model=List[Booking])
async def get_business_bookings(business_id: str, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    bookings = await db.bookings.find({"business_id": business_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

# ============ Order Routes ============

@api_router.post("/businesses/{business_id}/orders", response_model=Order)
async def create_order(business_id: str, order_data: OrderCreate):
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Calculate total and get product details
    order_items = []
    total_amount = 0.0
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id, "business_id": business_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        order_items.append(OrderItem(
            product_id=item.product_id,
            product_name=product['name'],
            quantity=item.quantity,
            mrp=product.get('mrp', product.get('price', 0)),
            sale_price=product.get('sale_price', product.get('price', 0)),
            discount_percentage=product.get('discount_percentage', 0)
        ))
        total_amount += product.get('sale_price', product.get('price', 0)) * item.quantity
    
    order = Order(
        business_id=business_id,
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        customer_address=order_data.customer_address,
        items=order_items,
        total_amount=total_amount,
        notes=order_data.notes
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    
    await db.orders.insert_one(order_dict)
    return order

@api_router.get("/businesses/{business_id}/orders", response_model=List[Order])
async def get_business_orders(business_id: str, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    orders = await db.orders.find({"business_id": business_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

# ============ Analytics Routes ============

@api_router.get("/businesses/{business_id}/analytics")
async def get_business_analytics(business_id: str, current_user: dict = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id, "user_id": current_user['id']}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Count products
    products_count = await db.products.count_documents({"business_id": business_id})
    
    # Count bookings
    total_bookings = await db.bookings.count_documents({"business_id": business_id})
    pending_bookings = await db.bookings.count_documents({"business_id": business_id, "status": "pending"})
    
    # Count orders
    total_orders = await db.orders.count_documents({"business_id": business_id})
    pending_orders = await db.orders.count_documents({"business_id": business_id, "status": "pending"})
    
    # Calculate total revenue from orders
    orders = await db.orders.find({"business_id": business_id}, {"_id": 0, "total_amount": 1}).to_list(1000)
    total_revenue = sum(order.get('total_amount', 0) for order in orders)
    
    return {
        "products_count": products_count,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue
    }

# ============ Admin Routes ============

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/admin/businesses")
async def get_all_businesses(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['super_admin', 'reseller']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    businesses = await db.businesses.find({}, {"_id": 0}).to_list(1000)
    for biz in businesses:
        if isinstance(biz.get('created_at'), str):
            biz['created_at'] = datetime.fromisoformat(biz['created_at'])
    return businesses

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_users = await db.users.count_documents({})
    total_businesses = await db.businesses.count_documents({})
    active_businesses = await db.businesses.count_documents({"is_active": True})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    
    # Revenue calculation
    orders = await db.orders.find({}, {"_id": 0, "total_amount": 1}).to_list(10000)
    total_revenue = sum(order.get('total_amount', 0) for order in orders)
    
    return {
        "total_users": total_users,
        "total_businesses": total_businesses,
        "active_businesses": active_businesses,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue
    }

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    if role not in ['super_admin', 'reseller', 'business_owner']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": "Role updated successfully"}

@api_router.get("/reseller/businesses")
async def get_reseller_businesses(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'reseller':
        raise HTTPException(status_code=403, detail="Access denied")
    
    # For now, resellers can see all businesses they created
    businesses = await db.businesses.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    for biz in businesses:
        if isinstance(biz.get('created_at'), str):
            biz['created_at'] = datetime.fromisoformat(biz['created_at'])
    return businesses

@api_router.get("/reseller/stats")
async def get_reseller_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'reseller':
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_businesses = await db.businesses.count_documents({"user_id": current_user['id']})
    active_businesses = await db.businesses.count_documents({"user_id": current_user['id'], "is_active": True})
    
    return {
        "total_businesses": total_businesses,
        "active_businesses": active_businesses
    }

# ============ Payment Gateway Routes ============

import razorpay
import hashlib
import hmac
import base64

# Payment Transaction Model
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_id: str
    order_id: str
    amount: float
    currency: str = "INR"
    gateway: str  # razorpay, stripe, payu, phonepe
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    status: str = "pending"  # pending, success, failed
    customer_name: str
    customer_email: str
    customer_phone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreatePaymentRequest(BaseModel):
    order_id: str
    amount: float
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    stripe_session_id: Optional[str] = None
    payu_txnid: Optional[str] = None
    phonepe_transaction_id: Optional[str] = None

# Razorpay Payment
@api_router.post("/public/businesses/{subdomain}/payments/razorpay/create")
async def create_razorpay_payment(subdomain: str, request: CreatePaymentRequest):
    """Create a Razorpay order for payment"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    if business.get('payment_gateway') != 'razorpay':
        raise HTTPException(status_code=400, detail="Razorpay not configured for this business")
    
    if not business.get('razorpay_key_id') or not business.get('razorpay_key_secret'):
        raise HTTPException(status_code=400, detail="Razorpay credentials not configured")
    
    try:
        client = razorpay.Client(auth=(business['razorpay_key_id'], business['razorpay_key_secret']))
        
        # Create Razorpay order (amount in paise)
        razorpay_order = client.order.create({
            "amount": int(request.amount * 100),
            "currency": "INR",
            "receipt": request.order_id,
            "payment_capture": 1
        })
        
        # Store payment transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "business_id": business['id'],
            "order_id": request.order_id,
            "amount": request.amount,
            "currency": "INR",
            "gateway": "razorpay",
            "gateway_order_id": razorpay_order['id'],
            "status": "pending",
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "key_id": business['razorpay_key_id'],
            "business_name": business['name'],
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")

@api_router.post("/public/businesses/{subdomain}/payments/razorpay/verify")
async def verify_razorpay_payment(subdomain: str, request: PaymentVerifyRequest):
    """Verify Razorpay payment signature"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    if not request.razorpay_order_id or not request.razorpay_payment_id or not request.razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing payment details")
    
    try:
        # Verify signature
        msg = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        generated_signature = hmac.new(
            business['razorpay_key_secret'].encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != request.razorpay_signature:
            # Update transaction status to failed
            await db.payment_transactions.update_one(
                {"gateway_order_id": request.razorpay_order_id},
                {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}}
            )
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        # Update transaction status to success
        await db.payment_transactions.update_one(
            {"gateway_order_id": request.razorpay_order_id},
            {"$set": {
                "status": "success",
                "gateway_payment_id": request.razorpay_payment_id,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Get transaction to update order
        transaction = await db.payment_transactions.find_one({"gateway_order_id": request.razorpay_order_id}, {"_id": 0})
        if transaction:
            await db.orders.update_one(
                {"id": transaction['order_id']},
                {"$set": {"status": "paid", "payment_id": request.razorpay_payment_id}}
            )
        
        return {"status": "success", "message": "Payment verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Stripe Payment using emergentintegrations
@api_router.post("/public/businesses/{subdomain}/payments/stripe/create")
async def create_stripe_payment(subdomain: str, request: CreatePaymentRequest):
    """Create a Stripe checkout session"""
    from fastapi import Request as FastAPIRequest
    
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    if business.get('payment_gateway') != 'stripe':
        raise HTTPException(status_code=400, detail="Stripe not configured for this business")
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        # Use Stripe test key from environment or business config
        stripe_key = business.get('stripe_secret_key') or os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
        
        # Get host URL from environment
        host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
        
        # Create checkout session
        success_url = f"{host_url.replace('/api', '')}/site/{subdomain}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url.replace('/api', '')}/site/{subdomain}/payment-cancel"
        
        checkout_request = CheckoutSessionRequest(
            amount=request.amount,
            currency="inr",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "order_id": request.order_id,
                "business_id": business['id'],
                "customer_email": request.customer_email
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "business_id": business['id'],
            "order_id": request.order_id,
            "amount": request.amount,
            "currency": "INR",
            "gateway": "stripe",
            "gateway_order_id": session.session_id,
            "status": "pending",
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "checkout_url": session.url,
            "session_id": session.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Stripe session: {str(e)}")

@api_router.get("/public/businesses/{subdomain}/payments/stripe/status/{session_id}")
async def get_stripe_payment_status(subdomain: str, session_id: str):
    """Check Stripe payment status"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_key = business.get('stripe_secret_key') or os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
        host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        
        stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=f"{host_url}/api/webhook/stripe")
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction if paid
        if status.payment_status == 'paid':
            await db.payment_transactions.update_one(
                {"gateway_order_id": session_id},
                {"$set": {"status": "success", "updated_at": datetime.now(timezone.utc)}}
            )
            
            # Update order status
            transaction = await db.payment_transactions.find_one({"gateway_order_id": session_id}, {"_id": 0})
            if transaction:
                await db.orders.update_one(
                    {"id": transaction['order_id']},
                    {"$set": {"status": "paid"}}
                )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount": status.amount_total,
            "currency": status.currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

# PayU Payment
@api_router.post("/public/businesses/{subdomain}/payments/payu/create")
async def create_payu_payment(subdomain: str, request: CreatePaymentRequest):
    """Create PayU payment hash and form data"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    if business.get('payment_gateway') != 'payu':
        raise HTTPException(status_code=400, detail="PayU not configured for this business")
    
    if not business.get('payu_merchant_key') or not business.get('payu_merchant_salt'):
        raise HTTPException(status_code=400, detail="PayU credentials not configured")
    
    try:
        txnid = str(uuid.uuid4())[:20]
        host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').replace('/api', '')
        
        # Generate hash
        hash_string = f"{business['payu_merchant_key']}|{txnid}|{request.amount}|{request.order_id}|{request.customer_name}|{request.customer_email}|||||||||||{business['payu_merchant_salt']}"
        hash_value = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
        
        # Store transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "business_id": business['id'],
            "order_id": request.order_id,
            "amount": request.amount,
            "currency": "INR",
            "gateway": "payu",
            "gateway_order_id": txnid,
            "status": "pending",
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "payu_url": "https://secure.payu.in/_payment",  # Use test URL for sandbox
            "key": business['payu_merchant_key'],
            "txnid": txnid,
            "amount": request.amount,
            "productinfo": request.order_id,
            "firstname": request.customer_name,
            "email": request.customer_email,
            "phone": request.customer_phone,
            "surl": f"{host_url}/site/{subdomain}/payment-success",
            "furl": f"{host_url}/site/{subdomain}/payment-failed",
            "hash": hash_value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create PayU payment: {str(e)}")

# PhonePe Payment
@api_router.post("/public/businesses/{subdomain}/payments/phonepe/create")
async def create_phonepe_payment(subdomain: str, request: CreatePaymentRequest):
    """Create PhonePe payment request"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    if business.get('payment_gateway') != 'phonepe':
        raise HTTPException(status_code=400, detail="PhonePe not configured for this business")
    
    if not business.get('phonepe_merchant_id') or not business.get('phonepe_salt_key'):
        raise HTTPException(status_code=400, detail="PhonePe credentials not configured")
    
    try:
        import json
        
        merchant_transaction_id = str(uuid.uuid4())[:35]
        host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').replace('/api', '')
        
        # Create payload
        payload = {
            "merchantId": business['phonepe_merchant_id'],
            "merchantTransactionId": merchant_transaction_id,
            "merchantUserId": request.customer_email,
            "amount": int(request.amount * 100),  # Amount in paise
            "redirectUrl": f"{host_url}/site/{subdomain}/payment-success?txnId={merchant_transaction_id}",
            "redirectMode": "REDIRECT",
            "callbackUrl": f"{host_url}/api/webhook/phonepe/{subdomain}",
            "paymentInstrument": {"type": "PAY_PAGE"}
        }
        
        payload_base64 = base64.b64encode(json.dumps(payload).encode()).decode()
        
        # Generate checksum
        salt_index = business.get('phonepe_salt_index', 1)
        string_to_hash = payload_base64 + "/pg/v1/pay" + business['phonepe_salt_key']
        checksum = hashlib.sha256(string_to_hash.encode()).hexdigest() + "###" + str(salt_index)
        
        # Store transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "business_id": business['id'],
            "order_id": request.order_id,
            "amount": request.amount,
            "currency": "INR",
            "gateway": "phonepe",
            "gateway_order_id": merchant_transaction_id,
            "status": "pending",
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "phonepe_url": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",  # Sandbox URL
            "payload": payload_base64,
            "checksum": checksum,
            "merchant_transaction_id": merchant_transaction_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create PhonePe payment: {str(e)}")

# Get payment gateway info for a business (public)
@api_router.get("/public/businesses/{subdomain}/payment-info")
async def get_business_payment_info(subdomain: str):
    """Get payment gateway info for customer checkout"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    gateway = business.get('payment_gateway')
    
    result = {
        "payment_enabled": gateway is not None,
        "gateway": gateway,
        "business_name": business['name']
    }
    
    # Include public key for Razorpay (needed for frontend)
    if gateway == 'razorpay' and business.get('razorpay_key_id'):
        result['razorpay_key_id'] = business['razorpay_key_id']
    
    # Include publishable key for Stripe
    if gateway == 'stripe':
        result['stripe_publishable_key'] = business.get('stripe_publishable_key')
    
    return result

# Get payment transaction status
@api_router.get("/public/businesses/{subdomain}/payments/{transaction_id}/status")
async def get_payment_transaction_status(subdomain: str, transaction_id: str):
    """Get payment transaction status"""
    business = await db.businesses.find_one({"subdomain": subdomain, "is_active": True}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    transaction = await db.payment_transactions.find_one({
        "business_id": business['id'],
        "$or": [
            {"id": transaction_id},
            {"gateway_order_id": transaction_id}
        ]
    }, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "status": transaction['status'],
        "amount": transaction['amount'],
        "gateway": transaction['gateway'],
        "order_id": transaction['order_id']
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()