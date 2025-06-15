import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
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

      <Switch>  {/* ✅ Replace <Routes> with <Switch> */}
        <Route exact path="/" component={Home} /> 
        {/* <Route path="/crops" component={CropManagement} />
        <Route path="/weather" component={Weather} /> */}
      </Switch>
    </div>
  );
};

export default App;