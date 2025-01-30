import React, { useEffect, useState } from 'react';
import style from './css/edit.module.css';

function Edit({ 
  editVenue, 
  setEditVenue, 
  openEditPopup, 
  setOpenEditPopup, 
  handleInputChange,
  handleContactChange,
  handleSave
}) {
  if (!openEditPopup) return null;

  return (
    <div className={style.modal}>
      <div className={style.modalContent}>
        <h2>Edit Venue</h2>
        <input
          type="text"
          name="name"
          value={editVenue.name || ""}
          onChange={handleInputChange}
          placeholder="Venue Name"
        />
        <input
          type="text"
          name="address"
          value={editVenue.address || ""}
          onChange={handleInputChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="phone"
          value={editVenue.contact.phone || ""}
          onChange={handleContactChange}
          placeholder="Phone"
        />
        <input
          type="email"
          name="email"
          value={editVenue.contact.email || ""}
          onChange={handleContactChange}
          placeholder="Email"
        />
        <input
          type="text"
          name="facebook"
          value={editVenue.contact.facebook || ""}
          onChange={handleContactChange}
          placeholder="Facebook"
        />
        <div className={style.modalButtons}>
          <button onClick={() => setOpenEditPopup(false)}>Cancel</button>
          <button onClick={handleSave}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default Edit;
