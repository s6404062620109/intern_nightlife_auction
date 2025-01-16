import React, { act, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/bidauction.module.css';

function Bidauction() {
  const [user, setUser] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    coin: null
  });
  const token = localStorage.getItem('authToken');      
  const { tableId, auctionId } = useParams();
  const [ bidHistory, setBidHistory ] = useState([]);
  const [ tableData, setTableData ] = useState({});
  const [ bidValue, setBidValue ] = useState(0);
  const [bitRate, setBitRate] = useState([10, 100, 1000, -10, -100, -1000]);
  const [selectedRate, setSelectedRate] = useState(bitRate[0]);
  const [ bidStatus, setBidStatus ] = useState("");
  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      localStorage.removeItem('authToken');
      navigate('/');
    }
    else{
      try{
        const response = await backend.get('/auth/authorization', {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
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
  }
  
  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  useEffect(() => {
    const fetchBidHistory = async () => {
      try{
        const response = await backend.get(`/bid/readByAuction/${auctionId}`);

        if(response.status === 200){
          const sortedBids = response.data.data.sort((a, b) => b.offerBid - a.offerBid);
          setBidHistory(sortedBids);
        }
      } catch(error) {
        console.log(error);
      }
    }
    const fetchTable = async () => {
      try{
        const response = await backend.get(`/table/readById/${tableId}`);

        if(response.status === 200){
          setTableData(response.data.data);
        }
      } catch(error) {
        console.log(error);
      }
    }

    fetchTable();
    fetchBidHistory();
  }, [auctionId]);

  const handleSubmitBid = async () => {
    try{
      const response = await backend.post('/bid/post', 
        {
          offerBid: bidValue,
          offerId: user.id,
          auctionId: auctionId
        }
      );

      if(response.status === 200){
        setBidStatus("You are current bid now.");
      }
    } catch(error){
      console.log(error);
      setBidStatus(error.response.data.message)
    }
  }

  const handleBidRateChange = (e) => {
    const rate = parseInt(e.target.value, 10);
    setSelectedRate(rate);
  };

  const handleApplyRate = () => {
    setBidValue((prevValue) => Math.max(0, prevValue + selectedRate));
  };

  return (
    <div className={style.container}>
      <div className={style["card-wrap"]}>

        <div className={style.head}>
          <h2>Table name:</h2>
          <p>{tableData.name}</p>
        </div>

        <div className={`${style.content} ${style.scrollable}`}>
          <table className={style['bid-table']}>
            <thead>
              <tr>
                <th>Bid Value</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {bidHistory.length > 0 ? (
                bidHistory.map((bid, index) => (
                  <tr key={bid._id}>
                    <td>{bid.offerBid}</td>
                    <td>{new Date(bid.time).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No bids yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={style["currentBid-wrap"]}>
          <p>Current Value :</p>
          {bidHistory.length > 0 ? ( // Check if bidHistory has at least one item
            <>
              <p>{bidHistory[0].offerBid}</p>
              <p>Coins</p>
            </>
          ) : (
            <p>No bids yet</p>
          )}
        </div>

        <div className={style["bid-wrap"]}>
          <div className={style["value-wrap"]}>
            <select
              value={selectedRate}
              onChange={handleBidRateChange}
              className={style['rate-selector']}
            >
              <option value={0}>0</option>
              {bitRate.map((rate) => (
                <option key={rate} value={rate}>
                  {rate > 0 ? `+${rate}` : rate}
                </option>
              ))}
            </select>
            <button onClick={handleApplyRate} className={style['apply-button']}>
              Bid rate
            </button>
            
            <div className={style["bidValue-wrap"]}>
              <p>{bidValue}</p>
            </div>
          </div>

          <div className={style["button-wrap"]}>
            <button onClick={() => handleSubmitBid()}>Current bid</button>
          </div>

          <label>{bidStatus}</label>
          
        </div>
      </div>
    </div>
  )
}

export default Bidauction