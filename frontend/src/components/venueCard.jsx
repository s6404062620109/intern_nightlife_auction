import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../api/backend';

import style from './css/venue.module.css';

function venueCard({ id, name, banner }) {
    const [imgPath, setImgPath] = useState(``);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBannerImg = async () => {
            try{
                const response = await backend.get(`/img/getImg/${banner}`);

                if(response.status === 200){
                    setImgPath(response.data.url);
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        fetchBannerImg();
    },[banner]);
  return (
    <div className={style.card}
        onClick={() => navigate(`/venuedetail/${id}`)}
    >
        {imgPath ? (
            <img alt="Venue banner" src={imgPath} />
        ) : (
            <p>Loading image...</p>
        )}

        <div className={style.cardInfo}>
            <p>Name: {name}</p>
        </div>
    </div>
  )
}

export default venueCard