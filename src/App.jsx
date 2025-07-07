import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
// import CropManagement from "./pages/CropManagement";
// import Weather from "./pages/Weather";

const App = () => {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | 
        {/* <Link to="/crops">Crop Management</Link> | 
        <Link to="/weather">Weather</Link> */}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/crops" element={<CropManagement />} />
        <Route path="/weather" element={<Weather />} /> */}
      </Routes>
    </div>
  );
};

export default App;