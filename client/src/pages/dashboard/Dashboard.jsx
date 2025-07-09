import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import cropService from '../../services/cropService';
import fieldService from '../../services/fieldService';
import weatherService from '../../services/weatherService';
import DashboardStats from './components/DashboardStats';
import UserProfile from './components/UserProfile';
import RecentCrops from './components/RecentCrops';
import RecentFields from './components/RecentFields';
import WeatherWidget from './components/WeatherWidget';
import LatestNotifications from './components/LatestNotifications';

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    crops: true,
    fields: true,
    weather: true,
    notifications: true
  });
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalFields: 0,
    upcomingHarvests: 0,
    pendingAlerts: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await userService.getProfile();
        setProfileData(profileResponse.data);
        setLoading(prev => ({ ...prev, profile: false }));
        
        // Fetch user's crops
        const cropsResponse = await cropService.getUserCrops(1, 5); // Page 1, limit 5
        setCrops(cropsResponse.data.crops);
        setStats(prev => ({ ...prev, totalCrops: cropsResponse.data.totalCount || 0 }));
        setLoading(prev => ({ ...prev, crops: false }));
        
        // Fetch user's fields
        const fieldsResponse = await fieldService.getUserFields(1, 5); // Page 1, limit 5
        setFields(fieldsResponse.data.fields);
        setStats(prev => ({ ...prev, totalFields: fieldsResponse.data.totalCount || 0 }));
        setLoading(prev => ({ ...prev, fields: false }));
        
        // Fetch weather based on user's location
        if (profileData?.location?.pincode || user?.location?.pincode) {
          const pincode = profileData?.location?.pincode || user?.location?.pincode;
          const weatherResponse = await weatherService.getWeatherByPincode(pincode);
          setWeather(weatherResponse.data);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const weatherResponse = await weatherService.getWeatherByCoordinates(latitude, longitude);
            setWeather(weatherResponse.data);
          });
        }
        setLoading(prev => ({ ...prev, weather: false }));
        
        // Fetch notifications
        const notificationsResponse = await userService.getNotifications();
        setNotifications(notificationsResponse.data);
        setStats(prev => ({ 
          ...prev, 
          pendingAlerts: notificationsResponse.data.filter(n => !n.read).length
        }));
        setLoading(prev => ({ ...prev, notifications: false }));
        
        // Calculate upcoming harvests
        const upcomingHarvests = crops.filter(crop => {
          if (!crop.plantingDate || !crop.harvestDuration) return false;
          const plantDate = new Date(crop.plantingDate);
          const harvestDate = new Date(plantDate);
          harvestDate.setDate(harvestDate.getDate() + crop.harvestDuration);
          const today = new Date();
          const daysUntilHarvest = Math.floor((harvestDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilHarvest > 0 && daysUntilHarvest <= 30; // Within 30 days
        }).length;
        
        setStats(prev => ({ ...prev, upcomingHarvests }));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {profileData?.name || user?.name || 'Farmer'}!
        </h1>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Link
            to="/crop/add"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Add Crop
          </Link>
          <Link
            to="/field/add"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Field
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats stats={stats} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Summary */}
          <UserProfile 
            user={profileData || user} 
            loading={loading.profile} 
          />

          {/* Recent Crops */}
          <RecentCrops 
            crops={crops} 
            loading={loading.crops} 
            totalCount={stats.totalCrops}
          />

          {/* Recent Fields */}
          <RecentFields 
            fields={fields} 
            loading={loading.fields} 
            totalCount={stats.totalFields}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget 
            weather={weather} 
            loading={loading.weather} 
          />

          {/* Latest Notifications */}
          <LatestNotifications 
            notifications={notifications} 
            loading={loading.notifications} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
