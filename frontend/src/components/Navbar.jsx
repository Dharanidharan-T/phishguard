import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Activity, FileSearch, Home as HomeIcon, Info, Server } from 'lucide-react';
import { checkHealth } from '../services/api';

const Navbar = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const verifyBackend = async () => {
      const res = await checkHealth();
      setIsOnline(res.status === 'healthy');
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand-logo">
          <ShieldAlert size={28} />
          <span>PhishGuard<span className="brand-ai-tag">AI</span></span>
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <HomeIcon size={16} /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/analyze" className={({ isActive }) => (isActive ? 'active' : '')}>
              <FileSearch size={16} /> Analyze
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Activity size={16} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Info size={16} /> About
            </NavLink>
          </li>
        </ul>

        <div className="nav-status">
          <Server size={14} />
          <span className="status-dot" style={{ backgroundColor: isOnline ? '#00ff9d' : '#ff2a6d' }}></span>
          <span>{isOnline ? 'ENGINE ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
