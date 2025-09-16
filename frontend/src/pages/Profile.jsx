import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile data
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Profile</h1>
      {/* Display user info and their posts */}
    </div>
  );
};

export default Profile;
