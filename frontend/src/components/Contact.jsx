import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resortName: '',
    resortSize: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResortSizeChange = (value) => {
    setFormData({
      ...formData,
      resortSize: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        resortName: '',
        resortSize: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-slate-50 to-cyan-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-200 to-teal-200 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span className="text-sm text-teal-700 font-semibold uppercase tracking-wider">Contact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Request a Demo
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See SmartFlags in action. Our team will reach out within 24 hours.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@resort.com"
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                {/* Resort Name */}
                <div className="space-y-2">
                  <Label htmlFor="resortName" className="text-slate-700 font-medium">
                    Resort/Hotel Name *
                  </Label>
                  <Input
                    id="resortName"
                    name="resortName"
                    value={formData.resortName}
                    onChange={handleChange}
                    required
                    placeholder="Paradise Resort"
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Resort Size */}
              <div className="space-y-2">
                <Label htmlFor="resortSize" className="text-slate-700 font-medium">
                  Resort Size *
                </Label>
                <Select value={formData.resortSize} onValueChange={handleResortSizeChange} required>
                  <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select resort size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-25 seats)</SelectItem>
                    <SelectItem value="medium">Medium (26-75 seats)</SelectItem>
                    <SelectItem value="large">Large (76-150 seats)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (150+ seats)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-700 font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your requirements..."
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all section"
              >
                <Send className="mr-2 w-5 h-5 section-hover:translate-x-1 transition-transform" />
                Request Demo
              </Button>

              <p className="text-sm text-slate-500 text-center">
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Thank You!
              </h3>
              <p className="text-xl text-slate-600">
                We've received your request. Our team will contact you within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};