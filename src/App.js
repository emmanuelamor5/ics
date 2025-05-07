import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp.js';
import Login from './login.js';
import Welcome from './welcome.js';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;

// idk