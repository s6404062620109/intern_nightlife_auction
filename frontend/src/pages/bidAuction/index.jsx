import React from 'react';

import style from './css/bidauction.module.css';
import { useParams } from 'react-router-dom';

function Bidauction() {
    const { tableId, auctionId } = useParams();
  return (
    <div>Bidauction</div>
  )
}

export default Bidauction