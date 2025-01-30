import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import style from "./css/venueDetail.module.css";
import backend from "../../api/backend";
import Edit from "../../components/ManageVenue/edit";

function VenueDetail() {
  const { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    coin: null,
  });
  const [venueData, setVenueData] = useState({
    name: null,
    address: null,
    banner: null,
    ownerId: null,
    ownerName: null,
    contact: {
      phone: null,
      email: null,
      facebook: null,
    },
  });
  const [imgPath, setImgPath] = useState(``);
  const [hoverEditButton, setHoverEditButton] = useState(false);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [editVenue, setEditVenue] = useState({
    name: venueData?.name || "",
    address: venueData?.address || "",
    contact: {
      phone: venueData?.contact?.phone || "",
      email: venueData?.contact?.email || "",
      facebook: venueData?.contact?.facebook || "",
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        const response = await backend.get(`/venue/readById/${id}`);

        if (response.status === 200) {
          let data = response.data.data;

          setVenueData({
            ...venueData,
            name: data.name,
            address: data.address,
            banner: data.banner,
            ownerId: data.ownerId,
            contact: {
              phone: data.contact.phone,
              email: data.contact.email,
              facebook: data.contact.facebook,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    const autherization = async () => {
      try {
        const response = await backend.get("/auth/authorization", {
          withCredentials: true,
        });

        if (response.status === 200) {
          const userData = response.data;

          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            coin: userData.coin,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchVenueData();
    autherization();
  }, [id]);
  
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await backend.get(
          `/auth/readByOwnerId/${venueData.ownerId}`
        );

        if (response.status === 200) {
          let data = response.data.data;

          setVenueData({
            ...venueData,
            ownerName: data.name,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchBannerImg = async () => {
      try {
        const response = await backend.get(`/img/getImg/${venueData.banner}`);

        if (response.status === 200) {
          setImgPath(response.data.url);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchOwner();
    fetchBannerImg();
  }, [venueData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditVenue(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setEditVenue(prev => ({
      ...prev,
      contact: { ...prev.contact, [name]: value }
    }));
  };

  const handleSave = async () => {
    try {
        const response = await backend.put(`/venue/update/${id}`, { editVenue });
        if (response.status === 200) {
            setVenueData(editVenue);
            setIsEditing(false);
        }
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.venueCard}>
        <div className={style.imgBox}>
          <img alt="Venue Image" src={imgPath} />
        </div>

        <div className={style.infoBox}>
          <div className={style.info}>
            <h2>{venueData.name}</h2>
            <p>Location: {venueData.address}</p>
            <p>By: {venueData.ownerName}</p>
          </div>

          <div className={style.contact}>
            <h2>Venue Contact</h2>
            <p>
              <img alt="Contact phone icon" src="/Phone.svg" />
              {venueData.contact.phone}
            </p>
            <p>
              <img alt="Contact mail icon" src="/mail.svg" />
              {venueData.contact.email}
            </p>
            <p>
              <img alt="Contact facebook icon" src="/facebook_Icon.svg" />
              {venueData.contact.facebook}
            </p>
          </div>

          {venueData.ownerId === user.id ? (
            <div
              className={style["edit-icon-wrap"]}
              onMouseEnter={() => setHoverEditButton(true)}
              onMouseLeave={() => setHoverEditButton(false)}
              onClick={() => {
                    setEditVenue(venueData);
                    setOpenEditPopup(true);
                }}
            >
              <img
                alt="edit icon"
                src={hoverEditButton ? `/Edit_fill.svg` : `/Edit.svg`}
              />
              {hoverEditButton ? (
                <div className={style["edit-text"]}>Edit</div>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}

          <div className={style["button-wrap"]}>
            {venueData.ownerId === user.id ? (
              <button onClick={() => navigate(``)}>View Auctions</button>
            ) : (
              <button onClick={() => navigate(`/venuedetail/${id}/table`)}>
                Auction table
              </button>
            )}
          </div>
        </div>
      </div>

      <Edit 
        venueData={venueData}
        editVenue={editVenue}
        setEditVenue={setEditVenue}
        openEditPopup={openEditPopup}
        setOpenEditPopup={setOpenEditPopup}
        handleInputChange={handleInputChange}
        handleContactChange={handleContactChange}
        handleSave={handleSave}
      />
    </div>
  );
}

export default VenueDetail;
