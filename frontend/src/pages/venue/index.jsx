import React, { useEffect, useState } from 'react';
import backend from '../../api/backend';
import VenueCard from '../../components/venueCard';

import style from './css/venue.module.css'

function Venue() {
  const [ venueData, setVenueData ] = useState([]);

  useEffect(() => {
    const fetchVenuedata = async () => {
      try{
        const response = await backend('/venue/readAll');

        if(response.status === 200){
          setVenueData(response.data.data);
        }
      } catch(error){
        console.log(error);
      }
    }
    fetchVenuedata();
  }, []);
  
  return (
    <div className={style.container}>
      <div className={style.wrap}>
        {venueData.map((item) => (
          <VenueCard
            key={item._id}
            id={item._id}
            name={item.name}
            banner={item.banner}
          />
        ))}
      </div>
    </div>
  )
}

export default Venue