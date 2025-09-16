import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Entrepreneur Chat</Link>
        <div>
          {user ? (
            <div className="flex space-x-4">
              <Link to="/">Feed</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
