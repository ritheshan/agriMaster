import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-bg.svg";

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Smart Farming for a Better Tomorrow
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                AgriMaster combines advanced technology with agricultural expertise to help farmers increase productivity, monitor crops, and make data-driven decisions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium bg-accent-500 hover:bg-accent-600 text-primary-800 transition-all focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium border-2 border-white text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src={heroImage} 
                alt="Farming illustration"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
        <svg className="w-full h-16 md:h-24 text-white fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80">
          <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how AgriMaster can transform your farming experience with these powerful features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Crop Management */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Crop Management</h3>
              <p className="text-gray-600">
                Track your crops from planting to harvest. Get personalized recommendations for fertilizers, pesticides, and irrigation schedules.
              </p>
              <Link to="/crop" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
            
            {/* Weather Insights */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Weather Insights</h3>
              <p className="text-gray-600">
                Access accurate weather forecasts and receive alerts about adverse conditions that may affect your crops.
              </p>
              <Link to="/weather" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
            
            {/* Field Management */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Field Management</h3>
              <p className="text-gray-600">
                Map your fields, monitor soil health, and optimize land usage with our intuitive field management tools.
              </p>
              <Link to="/field" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
            
            {/* Community */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Farmer Community</h3>
              <p className="text-gray-600">
                Connect with fellow farmers, share knowledge, ask questions, and participate in discussions on best farming practices.
              </p>
              <Link to="/community" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
            
            {/* AI Analytics */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Powered Analytics</h3>
              <p className="text-gray-600">
                Utilize machine learning technology to detect crop diseases early and predict yields based on current conditions.
              </p>
              <Link to="/" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
            
            {/* Calculator */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Profit Calculator</h3>
              <p className="text-gray-600">
                Calculate potential profits based on crop type, area, yield, and market prices to make informed financial decisions.
              </p>
              <Link to="/calculator" className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with AgriMaster is easy and straightforward
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-accent-500 flex items-center justify-center text-xl font-bold text-primary-800 mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Register Your Farm</h3>
              <p className="text-gray-600">
                Create an account and input details about your location, field sizes, and the crops you're growing.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-accent-500 flex items-center justify-center text-xl font-bold text-primary-800 mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Monitor Your Crops</h3>
              <p className="text-gray-600">
                Track growth progress, weather conditions, and receive personalized recommendations.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-accent-500 flex items-center justify-center text-xl font-bold text-primary-800 mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Optimize Your Yields</h3>
              <p className="text-gray-600">
                Use data-driven insights to make better decisions and improve your farm's productivity.
              </p>
            </div>
            
            {/* Connecting line - hidden on mobile */}
            <div className="absolute top-1/3 left-0 w-full border-t-2 border-dashed border-primary-300 hidden md:block"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-700 text-white py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-accent-400 mb-2">10,000+</div>
              <div className="text-xl">Farmers Using AgriMaster</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-accent-400 mb-2">50,000+</div>
              <div className="text-xl">Acres Managed</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-accent-400 mb-2">30%</div>
              <div className="text-xl">Average Yield Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex md:items-center py-10 px-6 md:p-12">
              <div className="md:w-3/5 mb-8 md:mb-0 md:pr-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Farming?</h2>
                <p className="text-lg text-primary-100 mb-6">
                  Join thousands of farmers who are already using AgriMaster to increase yields and simplify farm management.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium bg-accent-500 hover:bg-accent-600 text-primary-800 transition-all focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  Get Started For Free
                </Link>
              </div>
              <div className="md:w-2/5">
                <img 
                  src="/src/assets/logo.svg" 
                  alt="Farming illustration" 
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;