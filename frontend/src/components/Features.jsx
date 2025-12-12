import React from 'react';
import { Radio, Bell, CreditCard, Monitor, BarChart3, Zap } from 'lucide-react';
import { features } from '../mock';

const iconMap = {
  Radio,
  Bell,
  CreditCard,
  Monitor,
  BarChart3,
  Zap
};

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span className="text-sm text-teal-700 font-semibold uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need for
            <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Seamless Service
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Smart technology designed to enhance guest experience and operational efficiency
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <div
                key={feature.id}
                className="section relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg section-hover:scale-110 transition-transform duration-300">
                    {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-coral-500 rounded-full blur-xl opacity-0 section-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 section-hover:text-teal-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-teal-500 opacity-0 section-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">Want to see it in action?</p>
          <button
            onClick={() => {
              const element = document.getElementById('contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all hover:shadow-lg"
          >
            Schedule a Demo
          </button>
        </div>
      </div>
    </section>
  );
};