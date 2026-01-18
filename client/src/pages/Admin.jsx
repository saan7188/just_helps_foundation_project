import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Ensure this matches your Render URL
const API_URL = "https://justhelpsserver.onrender.com";

const Admin = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Causes (Verified + Unverified)
  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/causes/admin/all`, {
        headers: { 'x-auth-token': token }
      });
      setCauses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // 2. Accept / Verify Function
  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/causes/${id}`, 
        { isVerified: true }, 
        { headers: { 'x-auth-token': token } }
      );
      alert("Campaign Approved! ✅");
      fetchAll(); // Refresh list
    } catch (err) {
      alert("Verification failed");
    }
  };

  // 3. Delete / Reject Function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/reject this?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/causes/${id}`, {
        headers: { 'x-auth-token': token }
      });
      alert("Removed Successfully 🗑️");
      fetchAll();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="admin-container p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Control Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes.map(cause => (
          <div key={cause._id} className="border p-4 rounded-lg shadow bg-white">
            <img 
              src={cause.image.startsWith('http') ? cause.image : `${API_URL}${cause.image}`} 
              alt={cause.title} 
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="font-bold text-lg">{cause.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{cause.subtitle}</p>
            
            <div className="flex gap-2 mt-4">
              {!cause.isVerified && (
                <button 
                  onClick={() => handleVerify(cause._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                >
                  Accept
                </button>
              )}
              <button 
                onClick={() => handleDelete(cause._id)}
                className="bg-red-600 text-white px-4 py-2 rounded flex-1"
              >
                {cause.isVerified ? "Delete" : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
