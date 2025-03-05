import React, { useState } from 'react';
import backend from '../../api/backend';

import style from './css/addvenuepopup.module.css';

function AddVenuePopup({ onClose, ownerId }) {
  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    contact: {
      phone: '',
      email: '',
      facebook: '',
    },
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setNewVenue({ ...newVenue, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setNewVenue({
      ...newVenue,
      contact: { ...newVenue.contact, [e.target.name]: e.target.value },
    });
  };

  const handleFileChange = (e) => {
    setBannerFile(e.target.files[0]);
  };

  const handleAddVenue = async () => {
    if (!newVenue.name || !newVenue.address || !bannerFile) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!newVenue.contact.phone || !newVenue.contact.email || !newVenue.contact.facebook) {
      alert('Please fill in all contact details.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newVenue.name);
    formData.append('address', newVenue.address);
    formData.append('ownerId', ownerId);
    formData.append('banner', bannerFile);
    formData.append('contact[phone]', newVenue.contact.phone);
    formData.append('contact[email]', newVenue.contact.email);
    formData.append('contact[facebook]', newVenue.contact.facebook);

    setLoading(true);

    try {
      const response = await backend.post('/venue/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        alert('Venue added successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      alert('Failed to add venue. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className={style.modal}>
      <div className={style.modalContent}>
        <h2>Add Venue</h2>

        <label>Name</label>
        <input
          type="text"
          name="name"
          value={newVenue.name}
          onChange={handleInputChange}
          placeholder="Venue Name"
        />

        <label>Address</label>
        <input
          type="text"
          name="address"
          value={newVenue.address}
          onChange={handleInputChange}
          placeholder="Address"
        />

        <label>Banner Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={newVenue.contact.phone}
          onChange={handleContactChange}
          placeholder="Phone Number"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={newVenue.contact.email}
          onChange={handleContactChange}
          placeholder="Email"
        />

        <label>Facebook</label>
        <input
          type="text"
          name="facebook"
          value={newVenue.contact.facebook}
          onChange={handleContactChange}
          placeholder="Facebook"
        />

        <div className={style.modalButtons}>
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleAddVenue} disabled={loading}>
            {loading ? 'Adding...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddVenuePopup;
