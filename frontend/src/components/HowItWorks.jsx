import React from 'react';
import { UserPlus, Radio, UserCheck, TrendingUp } from 'lucide-react';
import { howItWorksSteps } from '../mock';

const iconMap = {
  UserPlus,
  Radio,
  UserCheck,
  TrendingUp
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-100 to-teal-100 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-cyan-100 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span className="text-sm text-cyan-700 font-semibold uppercase tracking-wider">Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How SmartFlags Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Simple, intuitive, and effective. Get started in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-cyan-300 to-teal-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => {
              const IconComponent = iconMap[step.icon];
              return (
                <div key={step.step} className="relative">
                  {/* Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 hover:border-teal-300 section">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6 mt-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {IconComponent && <IconComponent className="w-8 h-8 text-teal-600" />}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-teal-300">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-gradient-to-r from-teal-50 to-cyan-50 px-8 py-4 rounded-full border border-teal-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Setup in 2-3 days</span>
            </div>
            <div className="w-px h-6 bg-teal-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Full training included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};