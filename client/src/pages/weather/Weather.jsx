import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import weatherService from '../../services/weatherService';

const Weather = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationMethod, setLocationMethod] = useState('auto'); // 'auto', 'pincode', 'gps'
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Try to get location from user profile first
      if (user?.location?.pincode) {
        const response = await weatherService.getWeatherByPincode(user.location.pincode);
        setWeather(response.data.current);
        setForecast(response.data.forecast || []);
        setLocationMethod('pincode');
        setPincode(user.location.pincode);
      } else {
        // Try to get location from browser geolocation
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await weatherService.getWeatherByCoordinates(latitude, longitude);
            setWeather(response.data.current);
            setForecast(response.data.forecast || []);
            setLocationMethod('gps');
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Unable to get your location. Please enter a pincode.');
            setLocationMethod('pincode');
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      toast.error('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (!pincode) {
      toast.error('Please enter a valid pincode');
      return;
    }

    setLoading(true);
    try {
      const response = await weatherService.getWeatherByPincode(pincode);
      setWeather(response.data.current);
      setForecast(response.data.forecast || []);
      toast.success('Weather data updated successfully');
    } catch (error) {
      console.error('Failed to fetch weather by pincode:', error);
      toast.error('Failed to fetch weather data. Please check the pincode and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = () => {
    setLocationMethod('gps');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        try {
          const response = await weatherService.getWeatherByCoordinates(latitude, longitude);
          setWeather(response.data.current);
          setForecast(response.data.forecast || []);
          toast.success('Weather data updated successfully');
        } catch (error) {
          console.error('Failed to fetch weather by coordinates:', error);
          toast.error('Failed to fetch weather data. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter a pincode.');
        setLocationMethod('pincode');
      }
    );
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const lowerCondition = (condition || '').toLowerCase();
    
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

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Weather Forecast</h1>

      {/* Location selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Location</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <button
              onClick={() => setLocationMethod('pincode')}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                locationMethod === 'pincode'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Use Pincode
            </button>
          </div>
          
          <div className="flex-1">
            <button
              onClick={handleUseGPS}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                locationMethod === 'gps'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Use Current Location
            </button>
          </div>
        </div>

        {locationMethod === 'pincode' && (
          <form onSubmit={handlePincodeSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter pincode"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                pattern="[0-9]{6}"
                title="Please enter a valid 6-digit pincode"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto my-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !weather ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No Weather Data Available</h2>
          <p className="mt-2 text-gray-500">
            Please choose a location to view weather forecasts.
          </p>
        </div>
      ) : (
        <>
          {/* Current weather */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Weather</h2>
            
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <div className="text-5xl font-bold text-gray-800">{Math.round(weather.temperature)}°C</div>
                <div className="text-gray-600 mt-1">{weather.location}</div>
                <div className="text-gray-500 mt-1">Feels like {Math.round(weather.feelsLike)}°C</div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">Humidity:</span>
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">Wind:</span>
                    <span>{weather.windSpeed} km/h {weather.windDirection}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">Pressure:</span>
                    <span>{weather.pressure} hPa</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">Visibility:</span>
                    <span>{weather.visibility} km</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                {getWeatherIcon(weather.condition)}
                <div className="text-gray-700 mt-2">{weather.condition}</div>
                <div className="text-sm text-gray-500">
                  Updated: {new Date(weather.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {weather.alerts && weather.alerts.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center text-yellow-800 font-medium mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Weather Alert
                </div>
                {weather.alerts.map((alert, index) => (
                  <div key={index} className="mb-2 last:mb-0 pl-7">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-yellow-700">{alert.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5-Day Forecast</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {forecast.slice(0, 5).map((day, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="font-medium">{formatDate(day.date)}</div>
                    <div className="my-3">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="text-xl font-semibold mb-1">
                      {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                    </div>
                    <div className="text-gray-600 text-sm">{day.condition}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      <div>Humidity: {day.humidity}%</div>
                      <div>Rain: {day.rainChance}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Weather Tips for Farmers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800">Rain Preparation</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {weather.condition.toLowerCase().includes('rain')
                    ? 'Ensure proper drainage in your fields. Cover harvested crops to prevent moisture damage.'
                    : 'No rain expected in the next 24 hours. Good time for field work and harvesting if crops are ready.'}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <h3 className="font-medium text-yellow-800">Temperature Management</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {weather.temperature > 30
                    ? 'High temperatures expected. Ensure adequate irrigation and consider shade for sensitive crops.'
                    : weather.temperature < 15
                    ? 'Cool temperatures expected. Protect frost-sensitive crops and monitor soil temperature.'
                    : 'Moderate temperatures are good for most crop growth. Maintain regular irrigation schedule.'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800">Wind Advisory</h3>
                <p className="text-sm text-green-700 mt-1">
                  {weather.windSpeed > 20
                    ? 'Strong winds expected. Secure loose items and consider delaying spraying operations.'
                    : 'Calm to moderate winds. Good conditions for spraying if needed.'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-purple-800">Pest Management</h3>
                <p className="text-sm text-purple-700 mt-1">
                  {weather.humidity > 80
                    ? 'High humidity may increase risk of fungal diseases. Monitor crops closely and consider preventative treatments.'
                    : 'Moderate humidity levels. Standard pest management protocols recommended.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
