import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import API_URL from '../api';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Fundraiser',
    goalDescription: '',
    amountNeeded: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { title, subtitle, category, goalDescription, amountNeeded } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setImage(null);
      e.target.value = '';
      alert('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setImage(null);
      e.target.value = '';
      alert('Image must be 5 MB or smaller.');
      return;
    }

    setImage(selectedFile);
  };

  const onSubmit = async e => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedSubtitle = subtitle.trim();
    const trimmedDescription = goalDescription.trim();
    const amount = Number(amountNeeded);

    if (!trimmedTitle || !trimmedSubtitle || !trimmedDescription) {
      alert('Please complete all required fields.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }

    if (!image) {
      alert('Please choose a JPG, PNG, or WebP image up to 5 MB.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', trimmedTitle);
    data.append('subtitle', trimmedSubtitle);
    data.append('category', category);
    data.append('description', trimmedDescription);
    data.append('goalAmount', amount);
    data.append('image', image);

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/api/causes`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      alert('Campaign submitted successfully! It will appear after Admin approval.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to create campaign');
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
          <input
            type="text"
            name="title"
            value={title}
            onChange={onChange}
            maxLength={120}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Short Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={subtitle}
            onChange={onChange}
            maxLength={200}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Category</label>
          <select
            name="category"
            value={category}
            onChange={onChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="Fundraiser">Fundraiser</option>
            <option value="Essential">Essential (Food/Medicine)</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Description</label>
          <textarea
            name="goalDescription"
            value={goalDescription}
            onChange={onChange}
            maxLength={5000}
            className="w-full p-3 border rounded-lg"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Target Amount</label>
          <input
            type="number"
            name="amountNeeded"
            value={amountNeeded}
            onChange={onChange}
            min="1"
            step="0.01"
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Upload Image</label>
          <input
            type="file"
            onChange={onFileChange}
            className="w-full p-2"
            accept="image/jpeg,image/png,image/webp"
            required
          />
          <p className="text-sm text-gray-500 mt-1">JPG, PNG or WebP · Max 5 MB</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {loading ? 'Uploading...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default Create;
