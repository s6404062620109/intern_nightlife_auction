import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/auction.module.css';

function Auction() {
  const { tableId } = useParams();
  const [ auctionData, setAuctionData ] = useState([]);
  const [ activeAuctionId, setActiveAuctionId ] = useState(null);
  const navigate = useNavigate(); 

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

  const toggleAuctionDetails = (auctionId) => {
    setActiveAuctionId(activeAuctionId === auctionId ? null : auctionId);
  };

  const handleJoinAuction = (auctionId) => {
    navigate(`/auction/${tableId}/bidauction/${auctionId}`)
  }

  return (
    <div className={style.container}>
      <table className={style["auction-table"]}>
        <thead>
          <th>เวลาที่จอง</th>
          <th>เข้าร่วม</th>
        </thead>

        <tbody>
          {Object.entries(groupedAuctions).map(([date, auctions]) => (
            <tr key={date} className={style.dateGroup}>
              <td>
                {auctions.map((item) => (
                  <div key={item._id}>
                    <div
                      className={style["auction-Btn"]}
                      onClick={() => toggleAuctionDetails(item._id)}
                    >
                    <h2>{date}</h2>
                    {activeAuctionId === item._id ? '▲' : '▼'}
                    </div>
                    {activeAuctionId === item._id && (
                      <div className={style["auction-detail"]}>
                        <p>
                          Start: 
                          <label>
                            {new Date(item.checkpoint.start).toLocaleTimeString()}
                          </label>
                        </p>
                        <p>
                          End: 
                          <label>
                            {new Date(item.checkpoint.end).toLocaleTimeString()}
                          </label>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </td>

              {auctions.map((item) => (
                <td>
                  <button
                    onClick={() => handleJoinAuction(item._id)}
                  >
                    Join
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  )
}

export default Auction