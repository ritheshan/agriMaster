import React from 'react';
import { Link } from 'react-router-dom';

const WeatherWidget = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // If no weather data available
  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weather</h2>
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <p className="mt-2 text-gray-600">No weather data available.</p>
          <p className="text-sm text-gray-500">Set your location to get weather updates.</p>
        </div>
      </div>
    );
  }

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      );
    } else if (lowerCondition.includes('cloud')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
      );
    } else if (lowerCondition.includes('rain')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8zm9.447-11.167a.75.75 0 10-1.214-.882l-2.089 2.882-1.3-1.994a.75.75 0 10-1.269.804l1.264 1.944-1.428 1.71a.75.75 0 101.15.96l1.517-1.815 1.12 1.72a.75.75 0 001.272-.8l-1.323-2.035 2.3-3.175z" clipRule="evenodd" />
        </svg>
      );
    } else if (lowerCondition.includes('thunder')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Weather</h2>
        <Link to="/weather" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
          Full Forecast
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <div className="text-4xl font-bold text-gray-800">{Math.round(weather.temperature)}°C</div>
          <div className="text-gray-600">{weather.location}</div>
        </div>
        {getWeatherIcon(weather.condition)}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="text-sm">
          <span className="text-gray-500">Humidity:</span> {weather.humidity}%
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Wind:</span> {weather.windSpeed} km/h
        </div>
      </div>

      {weather.alerts && weather.alerts.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center text-yellow-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Weather Alert</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">{weather.alerts[0].description}</p>
        </div>
      )}

      {weather.forecastSummary && (
        <div className="mt-4 text-sm text-gray-600">
          <p>{weather.forecastSummary}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
