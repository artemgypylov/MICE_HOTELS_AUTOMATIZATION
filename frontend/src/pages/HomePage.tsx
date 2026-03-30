import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Star, 
  MapPin, 
  Users, 
  ArrowRight,
  Building2,
  Calendar,
  TrendingUp,
  CheckCircle,
  Award,
  Target,
  Shield
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import api from '../services/api';
import { Hotel } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await api.get('/hotels');
      return response.data;
    },
  });

  const handleStartBooking = (hotelId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/wizard/${hotelId}`);
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Configuration',
      description: 'Build your perfect event in minutes with our intelligent wizard',
      color: 'primary',
    },
    {
      icon: Target,
      title: 'Precise Budgeting',
      description: 'Real-time cost calculations with transparent pricing',
      color: 'accent',
    },
    {
      icon: Award,
      title: 'Premium Partners',
      description: 'Curated selection of top-tier venues and services',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Protected payments and guaranteed reservations',
      color: 'accent',
    },
  ];

  const stats = [
    { value: '500+', label: 'Events Delivered', icon: Calendar },
    { value: '50+', label: 'Partner Venues', icon: Building2 },
    { value: '10K+', label: 'Happy Attendees', icon: Users },
    { value: '4.9/5', label: 'Client Rating', icon: Star },
  ];

  const steps = [
    {
      number: '01',
      title: 'Choose Your Venue',
      description: 'Browse premium conference halls and meeting spaces',
      icon: Building2,
    },
    {
      number: '02',
      title: 'Customize Details',
      description: 'Select dates, capacity, catering, and equipment',
      icon: Calendar,
    },
    {
      number: '03',
      title: 'Get Instant Quote',
      description: 'Review transparent pricing and availability',
      icon: TrendingUp,
    },
    {
      number: '04',
      title: 'Confirm Booking',
      description: 'Secure your event with a few clicks',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="overflow-hidden bg-neutral-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Gradient orbs */}
          <motion.div 
            className="absolute -top-40 -left-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute top-1/3 -right-40 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute -bottom-40 left-1/3 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 bg-primary-100 text-primary-700 border-0 px-4 py-1.5">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Professional Event Platform
                </Badge>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Build Your Perfect
                <span className="gradient-text block mt-2">
                  Corporate Event
                </span>
              </h1>

              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                From conferences to incentives, plan and book exceptional MICE events 
                in minutes with our intelligent platform. Transparent pricing, 
                premium venues, instant confirmation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30 text-lg h-14"
                  onClick={() => navigate('/wizard')}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Planning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 text-lg h-14"
                  onClick={() => {
                    const element = document.getElementById('how-it-works');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span>24/7 support</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual element */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Main card with screenshot/illustration placeholder */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-2xl bg-white"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-accent-100 p-8 flex items-center justify-center">
                    <div className="w-full max-w-sm space-y-4">
                      {/* Mock interface preview */}
                      <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2" />
                            <div className="h-2 bg-neutral-100 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-neutral-100 rounded" />
                          <div className="h-2 bg-neutral-100 rounded w-5/6" />
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-3 bg-neutral-200 rounded w-1/3" />
                          <div className="px-2 py-1 bg-primary-100 rounded text-xs">
                            <div className="h-2 w-8 bg-primary-600 rounded" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-2 bg-neutral-100 rounded" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating stats cards */}
                <motion.div
                  className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ y: y1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">500+</div>
                      <div className="text-xs text-neutral-500">Events</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-xl p-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  style={{ y: y2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent-600 fill-accent-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">4.9</div>
                      <div className="text-xs text-neutral-500">Rating</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity }}
        >
          <div className="w-6 h-10 border-2 border-neutral-300 rounded-full p-1">
            <div className="w-1 h-2 bg-neutral-400 rounded-full mx-auto" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-neutral-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary-100 text-primary-700 border-0">
              Why Choose Motive
            </Badge>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need for Perfect Events
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed for event professionals who demand excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-accent-100 text-accent-700 border-0">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              From Idea to Event in 4 Steps
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our streamlined process makes event planning effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent -z-10" />
                  )}

                  <div className="text-center">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-bold text-primary-600 mb-2">{step.number}</div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Venues Preview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <Badge className="mb-4 bg-primary-100 text-primary-700 border-0">
                Premium Venues
              </Badge>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Handpicked Partner Locations
              </h2>
              <p className="text-xl text-neutral-600">
                Explore our curated selection of top-tier venues
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/wizard')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-96 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {hotels?.slice(0, 3).map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden h-full hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => handleStartBooking(hotel.id)}>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {hotel.name}
                        </h3>
                        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                          <Star className="w-3 h-3 mr-1 fill-primary-600" />
                          4.9
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-neutral-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        {hotel.city}
                      </div>
                      <Button className="w-full" variant="outline">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Your Next Event?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of event professionals who trust Motive for their corporate events. 
              Start planning in minutes, not days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary-700 hover:bg-neutral-50 shadow-xl h-14 text-lg"
                onClick={() => navigate('/wizard')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Free Planning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 h-14 text-lg"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-6">
              No credit card required • Free to explore • Instant access
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
