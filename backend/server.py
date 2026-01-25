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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

# Product Models
class BulkPricing(BaseModel):
    min_quantity: int
    price_per_unit: float

class ProductCreate(BaseModel):
    name: str
    description: str
    mrp: float
    sale_price: float
    bulk_pricing: Optional[List[BulkPricing]] = []
    image_url: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = "general"  # food, clothing, grocery, service, etc.
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
    price: float

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
            price=product['price']
        ))
        total_amount += product['price'] * item.quantity
    
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