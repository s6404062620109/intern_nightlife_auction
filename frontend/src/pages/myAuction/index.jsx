import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../api/backend';

import style from './css/myauction.module.css';

function MyAuction() {
    const { id, ownerId } = useParams();

    useEffect(() => {
      const fetchMyAuction = async () => {
        try{
          const response = await backend.get(`/auction/readMyAuctions/${id}`);
          
          if(response.status === 200){
            console.log(response);
          }
        } catch (error){
          console.log(error);
        }
      }
      fetchMyAuction();
    },[id]);
  return (
    <div>MyAuction</div>
  )
}

export default MyAuction