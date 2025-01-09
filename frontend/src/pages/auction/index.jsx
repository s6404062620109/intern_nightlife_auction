import React from 'react';

import style from './css/auction.module.css';
import { useParams } from 'react-router-dom';

function Auction() {
  const { venueId } = useParams();
  console.log(venueId);
  return (
    <div>Auction</div>
  )
}

export default Auction