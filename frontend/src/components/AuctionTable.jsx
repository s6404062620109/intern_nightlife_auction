import React, { useEffect, useState } from 'react'
import style from './css/auctiontable.module.css';
import backend from '../api/backend';
import { useNavigate } from 'react-router-dom';

function AuctionTable({ tableId }) {
    const [ auctionData , setAuctionData ] = useState([]);
    const [user, setUser] = useState({
          id: null,
          email: null,
          name: null,
          role: null,
          coin: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        const autherization = async () => {
          try{
            const response = await backend.get('/auth/authorization', {
              withCredentials: true
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
        autherization();
    }, []);

    useEffect(() => {
        const fetchAuctions = async () => {
            try{    
                const response = await backend.get(`/auction//readByTableId/${tableId}`);

                if(response.status === 200){
                    setAuctionData(response.data.data);
                }
            } catch (error) {
                console.log(error);
            }
            
        }
        fetchAuctions();
    }, [tableId]);

    const formatDateTime = (datetime) => {
        const date = new Date(datetime);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleString();
    };

    const handleJoinAuction = (auctionId) => {
        if(!user){
            alert("Please sign in before join auction.");
            navigate('/signin');
            return;
        }

        if(auctionId){
            navigate(`/auction/${tableId}/bidauction/${auctionId}`);
            return;
        }
    }
    
  return (
    <table className={style.auctionTable}>
        <thead>
            <th>เวลาที่เปิดจอง</th>
            <th>ราคาเริ่มต้น</th>
            <th>เข้าร่วม</th>
        </thead>

        <tbody>
        {auctionData.map((item, index) => (
            <tr key={index}>
                <td>
                    {formatDateTime(item.checkpoint.start)} - {formatDateTime(item.checkpoint.end)}
                </td>

                <td>
                    {item.startCoins} Coins
                </td>

                <td>
                    <button className={style.joinButton}
                        onClick={() => handleJoinAuction(item._id)}
                    >
                        Join
                    </button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
  )
}

export default AuctionTable