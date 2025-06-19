import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './signup.js';
import Login from './login.js';
import Roadupdate from './roadupdate.js';
import Home from './profile.js';
import LostAndFound from './lostandfound.js'; 
import Welcome from './Dashboard.js';
import ClaimForm from './claim.js';
import DriverDashboard from './driver-dashboard.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Home />} />
        <Route path="/roadupdate" element={<Roadupdate />} />
        <Route path="/lostandfound" element={<LostAndFound />} />
        <Route path="/dashboard" element={<Welcome />} />
        <Route path="/claim" element={<ClaimForm />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

