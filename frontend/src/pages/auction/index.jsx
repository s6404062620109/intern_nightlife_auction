import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/auction.module.css';

function Auction() {
  const { tableId } = useParams();
  const [ auctionData, setAuctionData ] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try{
        const response = await backend.get(`/auction/readByTableId/${tableId}`);

        if(response.status === 200){
          setAuctionData(response.data.data);
        }
      } catch (error){
        console.log(error);
      }
    }
    fetchAuctions();
  }, [tableId]);

  const groupedAuctions = auctionData.reduce((acc, item) => {
    const date = new Date(item.checkpoint.start).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className={style.container}>
      {Object.entries(groupedAuctions).map(([date, auctions]) => (
        <div key={date} className={style.dateGroup}>
          <h2>{date}</h2>
          {auctions.map((item) => (
            <div className={style.auctionList} key={item._id}>
              <p>Start Auction: {new Date(item.checkpoint.start).toLocaleTimeString()}</p>
              <p>End Auction: {new Date(item.checkpoint.end).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Auction