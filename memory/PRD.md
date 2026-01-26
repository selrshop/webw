# WAConnect - WhatsApp-Powered Business Websites

## Original Problem Statement
Build a SaaS platform for businesses in India to create websites focused on WhatsApp for communications, including inquiries, bookings, and ordering. Similar to Wix/Shopify but centered around WhatsApp integration.

## Core Requirements
1. **Template-Based Websites:** Variety of templates for different business types (restaurants, clinics, services, retail)
2. **Website Customization:** Logo, cover photo, gallery (16 images), YouTube, social links, address, phone, reviews, QR code
3. **Product Management:** MRP/sale price with discounts, dynamic attributes (veg/non-veg, sizing/color)
4. **Role-Based Access:** Super Admin, Reseller, Business Owner
5. **Business Features:** Delivery charges, taxes, location map
6. **Payment Integrations:** Razorpay, PayU, PhonePe (planned)
7. **Universal Template:** Color-customizable template for service businesses

## Tech Stack
- **Backend:** FastAPI + MongoDB (motor)
- **Frontend:** React + Tailwind CSS + shadcn/ui
- **Auth:** JWT tokens with localStorage

## What's Been Implemented

### Backend (server.py)
- User authentication (register, login) with JWT
- Business CRUD with subdomain support
- Product management with MRP/sale price
- Booking and Order management
- Analytics endpoint
- Role-based access (super_admin, reseller, business_owner)
- Public business API by subdomain

### Frontend
- Landing page with professional footer (Product, Resources, Company, social icons)
- Auth page (signup/login)
- Dashboard with role-based routing
- Super Admin Dashboard
- Reseller Dashboard
- Business Setup wizard (3-step process)
- Business Settings page
- Products management page
- Bookings page
- Orders page

### Customer-Facing Templates
- RestaurantTemplate.jsx - For restaurants/food businesses
- RetailTemplate.jsx - For retail/e-commerce
- DoctorTemplate.jsx - For medical/healthcare
- UniversalServiceTemplate.jsx - For all other service businesses

### Template Router (CustomerSite.jsx)
- Routes to appropriate template based on business.template_type
- Supports: restaurant, chef → RestaurantTemplate
- Supports: retail, grocery, salon → RetailTemplate
- Supports: doctor, clinic, diagnostic → DoctorTemplate
- Default: UniversalServiceTemplate

## Completed (January 2025)
- [x] Fixed frontend compilation error (Pinterest icon not exported from lucide-react)
- [x] Added professional SaaS-style footer to landing page
- [x] UniversalServiceTemplate fully integrated into CustomerSite router
- [x] Session persistence verified working
- [x] All 23 backend API tests passing
- [x] Frontend fully functional
- [x] **P2: Dynamic Product Attributes UI** - Veg/non-veg toggle for food/grocery, sizes/colors selection for clothing
- [x] **P2: Business Settings UI** - Delivery charges, free delivery threshold, tax percentage, color scheme (8 presets + custom pickers)

## Upcoming Tasks (P1)
- [ ] Create SalonTemplate.jsx (priority template)
- [ ] Create GroceryTemplate.jsx (priority template)
- [ ] Enhance templates with full feature set (gallery, video, social links, map, reviews, QR code)

## Future/Backlog
- [ ] Payment gateway integrations (Razorpay, PayU, PhonePe)
- [ ] Additional templates (Gym, Event Planner, Tours, etc.)
- [ ] Reviews feature
- [ ] Enquiry Form improvements
- [ ] Reseller Dashboard features

## Test Credentials
- **Super Admin:** admin@waconnect.com / admin123
- **Reseller:** reseller@waconnect.com / reseller123
- **Test User:** testuser@example.com / password123

## Test Businesses
- /site/demorestaurant (Restaurant template)
- /site/democonsulting (Universal template)

## Key Files
- `/app/backend/server.py` - Main backend with all routes
- `/app/frontend/src/pages/LandingPage.jsx` - Landing page with footer
- `/app/frontend/src/pages/CustomerSite.jsx` - Template router
- `/app/frontend/src/pages/templates/` - All customer templates
- `/app/backend/tests/test_api.py` - Backend API tests
