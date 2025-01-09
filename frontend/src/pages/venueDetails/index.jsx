import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import style from './css/venueDetail.module.css';
import backend from '../../api/backend';

function VenueDetail() {
    const { id } = useParams();
    const [user, setUser] = useState({
        email: null,
        name: null,
        role: null,
        coin: null
    });
    const [ venueData, setVenueData ] = useState({
        name: null,
        address: null,
        banner: null
    });
    const [ tableData, settableData ] = useState([]);
    const [ tableSelected, setTableSelected ] = useState("");
    const [imgPath, setImgPath] = useState(``);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVenueData = async () => {
            try{
                const response = await backend.get(`/venue/readById/${id}`);

                if(response.status === 200){
                    let data = response.data.data;
                    setVenueData({
                        name: data.name,
                        address: data.address,
                        banner: data.banner
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchVenueData();
    }, [id]);

    useEffect(() => {
        const fetchTablesVenue = async () => {
            try{
                const response = await backend.get(`/table/readByVenueId/${id}`);

                if(response.status === 200){
                    let data = response.data.data;
                    settableData(data);
                }
            }
            catch(error) {
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

        fetchTablesVenue();
        fetchBannerImg();
    }, [venueData]);

    const navigateToAuction = (id) => {

        if(!token){
            alert("Please Sign In before Auction");
            navigate('/signin');
            return;
        }
        navigate(`/auction/${id}`);
    } 
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
                <h2>Name: {venueData.name}</h2>
                <p>Location: {venueData.address}</p>


                <button
                    onClick={() => navigateToAuction()}
                >
                    เข้าร่วมประมูลโต็ะ
                </button>
            </div>
        </div>
    </div>
  )
}

export default VenueDetail