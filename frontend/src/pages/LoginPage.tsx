import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userRole', response.data.user.role);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 mb-4">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="mt-2 text-gray-500">Sign in to continue to MICE Pro</p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">or</span>
                </div>
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <RouterLink
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Sign Up
                </RouterLink>
              </p>

              {/* Demo accounts */}
              <div className="mt-8 rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-center text-gray-500">
                  <span className="font-medium">Demo:</span> client@example.com / admin@example.com
                  <br />
                  <span className="font-medium">Password:</span> password123 / admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-pink-500" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Create Amazing Events
            </h2>
            <p className="text-lg text-white/80">
              Plan conferences, trainings, and corporate events with our powerful MICE platform. 
              Get instant quotes and manage everything in one place.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { value: '500+', label: 'Events' },
                { value: '50+', label: 'Hotels' },
                { value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
