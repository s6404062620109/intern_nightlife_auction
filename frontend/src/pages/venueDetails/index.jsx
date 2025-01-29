import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import style from './css/venueDetail.module.css';
import backend from '../../api/backend';

function VenueDetail() {
    const { id } = useParams();
    const [user, setUser] = useState({
          id: null,
          email: null,
          name: null,
          role: null,
          coin: null
    });
    const [ venueData, setVenueData ] = useState({
        name: null,
        address: null,
        banner: null,
        ownerId: null,
        ownerName: null,
        contact: {
            phone: null,
            email: null,
            facebook: null
        }
    });
    const [imgPath, setImgPath] = useState(``);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVenueData = async () => {
            try{
                const response = await backend.get(`/venue/readById/${id}`);

                if(response.status === 200){
                    let data = response.data.data;

                    setVenueData({
                        ...venueData,
                        name: data.name,
                        address: data.address,
                        banner: data.banner,
                        ownerId: data.ownerId,
                        contact: {
                            phone: data.contact.phone,
                            email: data.contact.email,
                            facebook: data.contact.facebook
                        }
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }

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
          
        fetchVenueData();
        autherization();
    }, [id]);

    useEffect(() => {
        const fetchOwner = async () => {
            try{
                const response = await backend.get(`/auth/readByOwnerId/${venueData.ownerId}`);

                if(response.status === 200){
                    let data = response.data.data;
                    
                    setVenueData({
                        ...venueData,
                        ownerName: data.name,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
        const fetchBannerImg = async () => {
            try{
                const response = await backend.get(`/img/getImg/${venueData.banner}`);

                if(response.status === 200){
                    setImgPath(response.data.url);
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        fetchOwner();
        fetchBannerImg();
    }, [venueData]);

  return (
    <div className={style.container}>
        <div className={style.venueCard}>
            <div className={style.imgBox}>
                <img
                    alt='Venue Image'
                    src={imgPath}
                />
            </div>
            <div className={style.infoBox}>
                <div className={style.info}>
                    <h2>{venueData.name}</h2>
                    <p>Location: {venueData.address}</p>
                    <p>By: {venueData.ownerName}</p>
                </div>

                <div className={style.contact}>
                    <h2>Venue Contact</h2>
                    <p>
                        <img
                            alt='Contact phone icon'
                            src='/Phone.svg'
                        />
                        {venueData.contact.phone}
                    </p>
                    <p>
                        <img
                            alt='Contact mail icon'
                            src='/mail.svg'
                        />
                        {venueData.contact.email}
                    </p>
                    <p>
                        <img
                            alt='Contact facebook icon'
                            src='/facebook_Icon.svg'
                        />
                        {venueData.contact.facebook}
                    </p>
                </div>

                <div className={style["button-wrap"]}>
                    {venueData.ownerName === user.name ? (
                        <button onClick={() => navigate(``)}>View Auctions</button>
                    ) : (
                        <button onClick={() => navigate(`/venuedetail/${id}/table`)}>Auction table</button>
                    )}
                    
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default VenueDetail