import React from 'react';
import { Heart, TrendingUp, Gauge, LineChart } from 'lucide-react';
import { benefits } from '../mock';

const iconMap = {
  Heart,
  TrendingUp,
  Gauge,
  LineChart
};

export const Benefits = () => {
  return (
    <section id="benefits" className="py-24 bg-gradient-to-br from-slate-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span className="text-sm text-teal-700 font-semibold uppercase tracking-wider">Benefits</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Transform Your Resort
            <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Operations
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real results from resorts using SmartFlags
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = iconMap[benefit.icon];
            return (
              <div
                key={benefit.id}
                className="section relative bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex items-start space-x-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {benefit.description}
                    </p>

                    {/* Stat */}
                    <div className="inline-flex items-baseline space-x-2 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-lg border border-teal-200">
                      <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {benefit.stat}
                      </span>
                      <span className="text-sm text-slate-600 font-medium">
                        {benefit.statLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Elevate Your Guest Experience?
            </h3>
            <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Join 150+ luxury resorts worldwide and see results in weeks, not months.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center px-8 py-4 bg-white text-teal-600 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Get Started Today
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};