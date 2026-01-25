import { Link } from 'react-router-dom';
import { MessageCircle, Store, TrendingUp, Zap, Check, ArrowRight, Smartphone, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Integration",
      description: "Direct communication with customers through WhatsApp for orders, bookings & enquiries"
    },
    {
      icon: <Store className="w-8 h-8" />,
      title: "Ready-Made Websites",
      description: "Get your business online in minutes with beautiful, mobile-optimized websites"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Custom Subdomain",
      description: "Your unique web address: yourbusiness.waconnect.site"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-First Design",
      description: "Perfect experience on all devices, optimized for Indian users"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Track orders, bookings and customer engagement in real-time"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "No Coding Needed",
      description: "Simple setup process - add your products, services and you're live"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Custom subdomain",
        "Up to 20 products",
        "WhatsApp click-to-chat",
        "Booking form",
        "Basic analytics"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "₹499/mo",
      description: "For growing businesses",
      features: [
        "Everything in Basic",
        "Unlimited products",
        "WhatsApp Business API",
        "Automated messages",
        "Advanced analytics",
        "Custom domain support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For established businesses",
      features: [
        "Everything in Pro",
        "Multi-location support",
        "Priority support",
        "Custom integrations",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold text-primary">WAConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button data-testid="nav-login-btn" variant="ghost" className="font-medium">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button data-testid="nav-signup-btn" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6 leading-tight">
                Grow Your Business with WhatsApp
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Get a beautiful website connected to WhatsApp. Accept orders, bookings & enquiries directly on WhatsApp - the platform your customers already use.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button data-testid="hero-cta-btn" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
                    Start Free Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button data-testid="hero-demo-btn" variant="outline" className="bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-full px-8 py-6 text-lg font-medium transition-all">
                  View Demo Site
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-accent" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-accent" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3932728/pexels-photo-3932728.jpeg" 
                alt="Indian business owner" 
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for Indian businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                data-testid={`feature-card-${index}`}
                className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 p-6 rounded-2xl group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-heading font-medium mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
              Launch in 3 Simple Steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Sign Up & Setup</h3>
              <p className="text-muted-foreground">Create your account and add business details in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Add Products & Services</h3>
              <p className="text-muted-foreground">Upload your catalog with prices and images</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Start Receiving Orders</h3>
              <p className="text-muted-foreground">Share your link and get orders on WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade as you grow</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                data-testid={`pricing-plan-${index}`}
                className={`bg-white border-2 ${
                  plan.popular ? 'border-primary/50 shadow-xl' : 'border-transparent shadow-lg'
                } hover:shadow-xl transition-all duration-300 p-8 rounded-3xl relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-secondary text-black px-4 py-1 text-sm font-medium rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-heading font-semibold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-2">{plan.price}</div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth">
                  <Button 
                    data-testid={`pricing-cta-${index}`}
                    className={`w-full rounded-full py-6 text-base font-medium ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg'
                        : 'bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Join thousands of Indian businesses already using WhatsApp to connect with customers
          </p>
          <Link to="/auth">
            <Button data-testid="footer-cta-btn" className="bg-primary hover:bg-primary/90 text-white rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-700">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
                <span className="text-2xl font-heading font-bold">WAConnect</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Empowering Indian businesses to grow with WhatsApp-powered websites.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-linkedin">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-youtube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#templates" className="text-gray-400 hover:text-white transition-colors text-sm">Templates</a></li>
                <li><a href="#integrations" className="text-gray-400 hover:text-white transition-colors text-sm">Integrations</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#help" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
                <li><a href="#guides" className="text-gray-400 hover:text-white transition-colors text-sm">Guides</a></li>
                <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#api" className="text-gray-400 hover:text-white transition-colors text-sm">API Docs</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#careers" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><a href="#partners" className="text-gray-400 hover:text-white transition-colors text-sm">Partners</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 WAConnect. All rights reserved. Made with ❤️ for Indian Businesses
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;