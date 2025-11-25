import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import type { User } from '../types/types';
import { mockUsers } from '../data/mock';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    if (!email || !password) return;
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - replace with real auth
      const user = mockUsers.find(u => u.email === email && u.email.split('@')[0] === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Use "instructor" or "student" as password for demo.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.log(`Error: ${err}`)
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-blue-300 to-white-100">
      {/* Login Card */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-500 rounded-2xl mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
            <p className="text-gray-500">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Instructor:</strong> denis@innopolis.ru / denis</p>
                <p><strong>Student:</strong> arsen@innopolis.university / arsen</p>
              </div>
            </div>


            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="you@innopolis.university"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}