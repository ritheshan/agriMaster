import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";

// Lazy loading for better performance
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const CropManagement = React.lazy(() => import("./pages/crop/CropManagement"));
const FieldManagement = React.lazy(() => import("./pages/field/FieldManagement"));
const Weather = React.lazy(() => import("./pages/weather/Weather"));
const Community = React.lazy(() => import("./pages/community/Community"));
const Calculator = React.lazy(() => import("./pages/calculator/Calculator"));
const Contact = React.lazy(() => import("./pages/Contact"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <>
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      }>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/crop/*" element={
                <ProtectedRoute>
                  <CropManagement />
                </ProtectedRoute>
              } />
              <Route path="/field/*" element={
                <ProtectedRoute>
                  <FieldManagement />
                </ProtectedRoute>
              } />
              <Route path="/weather" element={
                <ProtectedRoute>
                  <Weather />
                </ProtectedRoute>
              } />
              <Route path="/community/*" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/calculator" element={
                <ProtectedRoute>
                  <Calculator />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </React.Suspense>
    </>
  );
};

export default App;