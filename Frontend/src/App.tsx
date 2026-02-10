import type { Component } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import LandingPage from './pages/landingpage';
import Sewa from './pages/sewa';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';

const App: Component = () => {
  return (
    <Router>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/sewa" component={Sewa} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
    </Router>
  );
};

export default App;
