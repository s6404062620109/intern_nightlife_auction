import React, { useEffect, useState } from 'react';
import style from './css/edit.module.css';

function Edit({ 
  editVenue, 
  setEditVenue,
  updateMessage,
  openEditPopup, 
  setOpenEditPopup, 
  handleInputChange,
  handleContactChange,
  handleSave
}) {
  if (!openEditPopup) return null;
  // console.log(editVenue);
  return (
    <div className={style.modal}>
      <div className={style.modalContent}>
        <h2>Edit Venue</h2>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={editVenue.name}
          onChange={handleInputChange}
          placeholder="Venue Name"
        />
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={editVenue.address}
          onChange={handleInputChange}
          placeholder="Address"
        />
        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={editVenue.contact.phone}
          onChange={handleContactChange}
          placeholder="Phone Number"
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={editVenue.contact.email}
          onChange={handleContactChange}
          placeholder="Email"
        />
        <label>Facebook</label>
        <input
          type="text"
          name="facebook"
          value={editVenue.contact.facebook}
          onChange={handleContactChange}
          placeholder="Facebook"
        />
        <div className={style.modalButtons}>
          <button onClick={() => setOpenEditPopup(false)}>Cancel</button>
          <button onClick={handleSave}>Confirm</button>
        </div>

        <label>{updateMessage}</label>
      </div>
    </div>
  );
}

export default Edit;
