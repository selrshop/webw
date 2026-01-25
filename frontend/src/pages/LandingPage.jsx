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
      <footer className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-primary">WAConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 WAConnect. Made with ❤️ for Indian Businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;