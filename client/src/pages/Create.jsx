import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://justhelpsserver.onrender.com";

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Fundraiser', // Default category
    goalDescription: '',
    amountNeeded: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { title, subtitle, category, goalDescription, amountNeeded } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onFileChange = e => setImage(e.target.files[0]);

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // ✅ Using FormData is required for Multer to receive the image file
    const data = new FormData();
    data.append('title', title);
    data.append('subtitle', subtitle);
    data.append('category', category);
    data.append('description', goalDescription);
    data.append('goalAmount', amountNeeded);
    if (image) data.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/causes`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      alert("Campaign submitted successfully! It will appear after Admin approval.");
      navigate('/'); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Start a Fundraiser</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">Campaign Title</label>
          <input type="text" name="title" value={title} onChange={onChange} className="w-full p-3 border rounded-lg" required />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Short Subtitle</label>
          <input type="text" name="subtitle" value={subtitle} onChange={onChange} className="w-full p-3 border rounded-lg" required />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Category</label>
          <select name="category" value={category} onChange={onChange} className="w-full p-3 border rounded-lg">
            <option value="Fundraiser">Fundraiser</option>
            <option value="Essential">Essential (Food/Medicine)</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Description</label>
          <textarea name="goalDescription" value={goalDescription} onChange={onChange} className="w-full p-3 border rounded-lg" rows="4" required></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Upload Image</label>
          <input type="file" onChange={onFileChange} className="w-full p-2" accept="image/*" required />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {loading ? "Uploading..." : "Submit for Approval"}
        </button>
      </form>
    </div>
  );
};

export default Create;
