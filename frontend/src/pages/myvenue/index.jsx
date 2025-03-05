import React, { useEffect, useState } from 'react';
import backend from '../../api/backend';

import style from './css/myvenue.module.css';
import VenueCard from '../../components/venueCard';
import AddVenuePopup from './AddVenuePopup';

function MyVenue() {
  const [user, setUser] = useState({
      id: null,
      email: null,
      name: null,
      role: null,
      coin: null
  });
  const [ venueData, setVenueData ] = useState([]);
  const [ isPopupOpen, setIsPopupOpen ] = useState(false);

  useEffect(() => {
    const autherization = async () => {
      try{
        const response = await backend.get('/auth/authorization', {
          withCredentials: true
        });
  
        if(response.status === 200){
          const userData = response.data;
            
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            coin: userData.coin
          });
        }
  
        } catch (error) {
          console.log(error);
        }
    }
    autherization();
  }, []);

  useEffect(() => {
    const fetchMyVenue = async () => {
      try{
        const response = await backend(`/venue/readAllMyVenue/${user.id}`);

        if(response.status === 200){
          setVenueData(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchMyVenue();
  },[user]);

  return (
    <div className={style.container}>
      <h1>My Venue</h1>

      <div className={style.content}>
        <div className={style["content-wrap"]}>
          {venueData.length > 0 ? (
            <>
              {venueData.map((item) => (
                <VenueCard
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  banner={item.banner}
                />
              ))}
            </>
          ):(
            <div>Not have you venue.</div>  
          )}
        </div>
      </div>

      <div className={style["add-button-wrap"]}>
        <button onClick={() => setIsPopupOpen(true)}>
          <img alt="Add button" src="/Add_round_duotone.svg" />
          Add Venue
        </button>
      </div>

      {isPopupOpen && 
        <AddVenuePopup 
          onClose={() => setIsPopupOpen(false)} 
          ownerId={user.id} 
        />
      } 
    </div>
  )
}

export default MyVenue