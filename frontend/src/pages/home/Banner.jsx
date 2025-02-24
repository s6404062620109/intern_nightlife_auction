import React, { useEffect, useState } from 'react';
import VenueCard from '../../components/venueCard';
import style from './css/banner.module.css';

function Banner({ data }) {
  const [venueList, setVenueList] = useState([]);
  const [displayVenues, setDisplayVenues] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (data.length > 0) {
      const sortedVenues = [...data].sort((a, b) => b.auctions.length - a.auctions.length);
      setVenueList(sortedVenues);
      setDisplayVenues(sortedVenues.slice(0, 3));
    }
  }, [data]);

  useEffect(() => {
    if (venueList.length > 3) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000); // Auto change every 5s

      return () => clearInterval(interval);
    }
  }, [venueList, index]);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      const newIndex = (index + 1) % venueList.length;
      setIndex(newIndex);
      setDisplayVenues([
        venueList[newIndex % venueList.length],
        venueList[(newIndex + 1) % venueList.length],
        venueList[(newIndex + 2) % venueList.length]
      ]);
      setFade(true);
    }, 300);
  };

  const prevSlide = () => {
    setFade(false);
    setTimeout(() => {
      const newIndex = (index - 1 + venueList.length) % venueList.length;
      setIndex(newIndex);
      setDisplayVenues([
        venueList[newIndex % venueList.length],
        venueList[(newIndex + 1) % venueList.length],
        venueList[(newIndex + 2) % venueList.length]
      ]);
      setFade(true);
    }, 300);
  };

  return (
    <div className={style.container}>
      <h1>Auction Now!</h1>

      <div className={style.content}>
        <button className={style["change-button"]} onClick={prevSlide}>{'<'}</button>

        <div className={`${style["content-wrap"]} ${fade ? style.fadeIn : ""}`}>
          {displayVenues.map((item) => (
            <VenueCard
              key={item.venue._id}
              id={item.venue._id}
              name={item.venue.name}
              banner={item.venue.banner}
            />
          ))}
        </div>

        <button className={style["change-button"]} onClick={nextSlide}>{'>'}</button>
      </div>
      
    </div>
  );
}

export default Banner;
