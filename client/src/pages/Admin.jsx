import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://justhelpsserver.onrender.com";

const Admin = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [causes, setCauses] = useState([]);
  const [siteConfig, setSiteConfig] = useState({
    heroTitle: '',
    heroSubtitle: '',
    maintenanceMode: false,
    announcement: ''
  });
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { 'x-auth-token': token } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [causeRes, siteRes] = await Promise.all([
        axios.get(`${API_URL}/api/causes/admin/all`, config),
        axios.get(`${API_URL}/api/site`)
      ]);
      setCauses(causeRes.data);
      setSiteConfig(siteRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Admin Fetch Error", err);
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleUpdateSite = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/site`, siteConfig, config);
      alert("Global Settings Updated! ⚙️");
    } catch (err) { alert("Settings update failed"); }
  };

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/causes/${id}`, { isVerified: status }, config);
      fetchData();
    } catch (err) { alert("Verification failed"); }
  };

  const openEdit = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', editingItem.title);
    data.append('subtitle', editingItem.subtitle);
    data.append('category', editingItem.category);
    if (newImage) data.append('image', newImage);

    try {
      await axios.put(`${API_URL}/api/causes/${editingItem._id}`, data, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      setIsEditModalOpen(false);
      setNewImage(null);
      fetchData();
    } catch (err) { alert("Edit failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/causes/${id}`, config);
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  if (loading) return <div className="p-20 text-center text-xl">Initializing JustHelps Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {causes.length} Total Items
          </div>
        </header>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['stats', 'global settings', 'campaigns'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-semibold capitalize transition-all duration-200 ${
                activeTab === tab ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-600 border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- STATS TAB --- */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Active Fundraisers</p>
              <h2 className="text-4xl font-bold">{causes.filter(c => c.isVerified).length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Pending Approval</p>
              <h2 className="text-4xl font-bold text-orange-600">{causes.filter(c => !c.isVerified).length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Site Status</p>
              <h2 className={`text-xl font-bold ${siteConfig.maintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                {siteConfig.maintenanceMode ? 'Maintenance Mode Active' : 'Online'}
              </h2>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'global settings' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Home Page & System Config</h2>
            <form onSubmit={handleUpdateSite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hero Main Title</label>
                <input
                  type="text"
                  value={siteConfig.heroTitle}
                  onChange={(e) => setSiteConfig({...siteConfig, heroTitle: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Blocks public access to the home page</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteConfig.maintenanceMode}
                  onChange={(e) => setSiteConfig({...siteConfig, maintenanceMode: e.target.checked})}
                  className="w-6 h-6 accent-orange-600"
                />
              </div>
              <button className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition">
                Update Global Settings
              </button>
            </form>
          </div>
        )}

        {/* --- CAMPAIGNS TAB (With Edit and Verification) --- */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {causes.map(cause => (
              <div key={cause._id} className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-6 items-center">
                <img 
                  src={cause.image.startsWith('http') ? cause.image : `${API_URL}${cause.image}`} 
                  className="w-24 h-24 object-cover rounded-xl"
                  alt="Cause"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-gray-800">{cause.title}</h3>
                    <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${cause.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {cause.isVerified ? 'Live' : 'Approval Required'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1">{cause.subtitle}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {!cause.isVerified ? (
                    <button onClick={() => handleVerify(cause._id, true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex-1">Approve</button>
                  ) : (
                    <button onClick={() => handleVerify(cause._id, false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold flex-1">Disable</button>
                  )}
                  <button onClick={() => openEdit(cause)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex-1 border border-blue-100">Edit</button>
                  <button onClick={() => handleDelete(cause._id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex-1 border border-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Details</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input 
                type="text" 
                value={editingItem.title} 
                onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                className="w-full p-3 border rounded-xl"
                placeholder="Title"
              />
              <textarea 
                value={editingItem.subtitle} 
                onChange={(e) => setEditingItem({...editingItem, subtitle: e.target.value})}
                className="w-full p-3 border rounded-xl"
                placeholder="Subtitle"
                rows="3"
              />
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Change Image</label>
                <input type="file" onChange={(e) => setNewImage(e.target.files[0])} className="w-full text-xs" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-orange-600 text-white flex-1 py-3 rounded-xl font-bold">Save Update</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-100 text-gray-600 flex-1 py-3 rounded-xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
