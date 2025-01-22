import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import style from './css/venueDetail.module.css';
import backend from '../../api/backend';
import AuctionTable from '../../components/AuctionTable';

function VenueDetail() {
    const { id } = useParams();
    const [ venueData, setVenueData ] = useState({
        name: null,
        address: null,
        banner: null,
        ownerId: null,
        ownerName: null,
    });
    const [ tableData, settableData ] = useState([]);
    const [ tableSelected, setTableSelected ] = useState("");
    const [imgPath, setImgPath] = useState(``);

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
                        ownerId: data.ownerId
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchVenueData();
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
        fetchOwner();
    }, [venueData.ownerId]);

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

    const closePopup = () => setTableSelected('');

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
                    <h2>Name: {venueData.name}</h2>
                    <p>Location: {venueData.address}</p>
                    <p>Owner: {venueData.ownerName}</p>
                </div>

                <form 
                    onSubmit={(e) => e.preventDefault()}
                >
                    <h3>Table Plan</h3>

                    <img
                        alt='Table plan'
                        src='/Schema-table_plan.drawio.png'
                    />

                    <select
                        onChange={(e) => setTableSelected(e.target.value)}
                        value={tableSelected}
                    >
                        <option value="">Select a table</option>
                        {tableData.map((item) => (
                            <option 
                                key={item._id} 
                                value={item._id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </form>
         
            </div>
        </div>
        
        {tableSelected && (
            <>
                <div
                    className={`${style.overlay} ${tableSelected ? style.show : ''}`}
                    onClick={closePopup}
                ></div>
                <div
                    className={`${style['auction-table-wrap']} ${tableSelected ? style.show : ''}`}
                    >
                    <img
                        alt='Close button'
                        src='/Close_round.svg'
                        onClick={closePopup} 
                        className={style.closeButton}
                    />
                    <AuctionTable tableId={tableSelected} />
                </div>
            </>
        )}
        
    </div>
  )
}

export default VenueDetail