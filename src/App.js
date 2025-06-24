import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import Home from './Home.js';
import RatingsDisplay from './RatingsDisplay.js';
import SignUp from './signup.js';
import Login from './login.js';
import Roadupdate from './roadupdate.js';
import Homee from './profile.js';
import LostAndFound from './lostandfound.js'; 
import Welcome from './Dashboard.js';
import ClaimForm from './claim.js';
import DriverDashboard from './driver-dashboard.js';
import RatingForm from './RatingForm.js';
import StagesList from './StagesList.js';
import LandingPage from './landingpage.js';
import WeatherBox from './weatherbox.js';
import AdminDashboard from './AdminDashboard.js';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Homee />} />
        <Route path="/roadupdate" element={<Roadupdate />} />
        <Route path="/lostandfound" element={<LostAndFound />} />
        <Route path="/dashboard" element={<Welcome />} />
        <Route path="/claim" element={<ClaimForm />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/RatingForm" element={<RatingForm />} />
        <Route path="/RatingsDisplay" element={<RatingsDisplay />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/StagesList" element={<StagesList />} />
        <Route path="/weatherbox" element={<WeatherBox/>} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />

        {/* Add more routes as needed */}

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

