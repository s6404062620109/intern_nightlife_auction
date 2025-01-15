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
  const [ auctionData, setAuctionData ] = useState({});
  const [ tableData, setTableData ] = useState({});
  const [ bidValue, setBidValue ] = useState(0);
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
    const fetchAuction = async () => {
      try{
        const response = await backend.get(`/auction/readById/${auctionId}`);

        if(response.status === 200){
          setAuctionData(response.data.data);
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
    fetchAuction();
  }, [auctionId]);

  const handleBid = (act) => {
    if(act === "plus"){
      setBidValue(bidValue+auctionData.startCoins);
    }

    if(act === "minus"){
      if(bidValue !== 0){
        setBidValue(bidValue-auctionData.startCoins);
      }
    }
  }

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

  return (
    <div className={style.container}>
      <div className={style["card-wrap"]}>

        <div className={style.head}>
          <h2>
            Table name  
            {tableData.name}
          </h2>
        </div>

        <div className={style.content}>
          {/* ranking bid here */}
          <div>Not have current bid here.</div>
        </div>

        <div className={style["bid-wrap"]}>
          <div className={style["value-wrap"]}>
            <img
              alt='Minus bid value'
              src='/Remove_duotone.svg'
              onClick={() => handleBid("minus")}
            />

            <p>{bidValue}</p>

            <img
              alt='Plus bid value'
              src='/Add_round_duotone.svg'
              onClick={() => handleBid("plus")}
            />
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