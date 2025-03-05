import React, { useEffect, useState } from 'react'
import backend from '../../api/backend';

import style from './css/home.module.css';
import Banner from './Banner';

function Home() {
  const [data, setData] = useState([]);
  const fetchAuctions = async () => {
    try{
      const response = await backend.get('/auction/readAuctionForBanner');

      if(response.status === 200){
        setData(response.data.data);
      }
    } catch(error){
      console.log(error);
    }
  }
  useEffect(() => {
    fetchAuctions();
  },[]);

  return (
    <div className={style.container}>
      <Banner
        data={data}
      />
    </div>
  )
}

export default Home