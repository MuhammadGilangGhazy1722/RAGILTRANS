import type { Component } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmDialogContainer } from './components/ConfirmDialogContainer';

// Public Pages
import LandingPage from './pages/landingpage';
import Login from './pages/login';
import Register from './pages/register';
import OAuthCallback from './pages/OAuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Pages
import Home from './pages/user/home';
import Sewa from './pages/user/sewa';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCars from './pages/admin/Cars';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import Finance from './pages/admin/Finance';

const App: Component = () => {
  return (
    <>
      <ToastContainer />
      <ConfirmDialogContainer />
      <Router>
        {/* Public Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/oauth/callback" component={OAuthCallback} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        
        {/* User Routes (Logged In) */}
        <Route path="/home" component={Home} />
        <Route path="/sewa" component={Sewa} />
        <Route path="/profile" component={Profile} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/cars" component={AdminCars} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/finance" component={Finance} />
      </Router>
    </>
  );
};


export default App;
