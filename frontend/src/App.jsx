import React, { useState } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  const handleLoginSuccess = (newToken, email, role) => {
    setToken(newToken);
    setUserEmail(email);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserEmail('');
    setUserRole('');
  };

  return (
    <div className="App">
      {token ? (
        <Dashboard token={token} userEmail={userEmail} userRole={userRole} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
