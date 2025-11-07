import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, Shield } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    setSendingOtp(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/request-otp`, {
        email: formData.email
      });

      if (response.data.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent!",
          description: response.data.message,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send OTP. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpSent) {
      toast({
        title: "OTP Required",
        description: "Please request an OTP first by clicking 'Send OTP'",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
        email: formData.email,
        otp: formData.otp
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${response.data.user.name}!`,
          variant: "default"
        });

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      const errorMessage = error.response?.data?.detail || 'Invalid email or OTP. Please try again.';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            SmartFlags Admin
          </h1>
          <p className="text-slate-600 mt-2">Enter your OTP to access your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Enter the email address and OTP sent to you by the admin. Check your email for the 6-digit code.
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email Address *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@example.com"
                    className="pl-11 h-12 text-base"
                    disabled={otpSent}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || otpSent}
                  className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                >
                  {sendingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : otpSent ? (
                    '✓ Sent'
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
              {otpSent && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ OTP has been sent to your email
                </p>
              )}
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-slate-700 font-medium">
                One-Time Password (OTP) *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  className="pl-11 h-12 text-base tracking-widest"
                  disabled={!otpSent}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  The OTP is valid for 15 minutes
                </p>
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setFormData({ ...formData, otp: '' });
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !otpSent}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Didn't receive an OTP?{' '}
              <button className="text-teal-600 hover:text-teal-700 font-medium">
                Contact Support
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2024 SmartFlags. All rights reserved.
        </p>
      </div>
    </div>
  );
};
