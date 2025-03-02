import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Auth Page
import Login from "../page/authPage/Login";
import Authenticate from "../page/authPage/Authenticate";
// User Page
import Home from "../page/userPage/Home";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/authenticate" element={<Authenticate />} />
        
      </Routes>
    </Router>
  );
};

export default AppRoutes;
