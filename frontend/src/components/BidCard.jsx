import React, { useEffect, useState } from 'react';
import backend from '../api/backend';

import style from './css/bidcard.module.css';
import { useNavigate } from 'react-router-dom';

function BidCard({ 
    name, 
    address, 
    banner,
    auctionId,
    checkpoint,
    accessTime,
    table,
    winner, 
    bidValue, 
    bidTime 
}) {
    const [ imgPath, setImgPath ] = useState(``);
    const [ showMyBid, setShowMyBid ] = useState(false);
    const navigate = useNavigate('');

    useEffect(() => {
        const fetchBannerImg = async () => {
            try {
                const response = await backend.get(`/img/getImg/${banner}`);

                if (response.status === 200) {
                    setImgPath(response.data.url);
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        fetchBannerImg();
    }, [banner]);
    
    return (
        <div className={`${style["card-wrap"]} ${showMyBid ? style["show-bid"] : ""}`}>
            <div className={style.card}
                onClick={() => setShowMyBid(!showMyBid)}
            >
                <img src={imgPath} alt="Venue Banner" className={style.banner} />
                <div className={style.details}>
                    <h2>{name}</h2>
                    <p>{address}</p>
                    <p>โต๊ะที่ประมูล {table.name} จำนวนที่นั่ง {table.seats} </p>
                    <p>เวลาใช้โต๊ะ {new Date(accessTime).toLocaleString()}</p>
                    <p>เวลาประมูล {new Date(checkpoint.start).toLocaleString()} - {new Date(checkpoint.end).toLocaleString()}</p>
                </div>
            </div>
            {showMyBid && (
                <div className={style["Bid-details"]}>
                    <div className={style.myBid}>
                        <h3>การประมูลของคุณ</h3>
                        <p>คุณประมูลล่าสุดเมื่อ {new Date(bidTime).toLocaleString()}</p>
                        <p>เงินประมูลล่าสุดของคุณ <strong>{bidValue}</strong> coins</p>
                    </div>
                    {winner && winner.name ? (
                        <div className={style.winner}>
                            <p>ผู้ชนะการประมูล <strong>{winner.name}</strong></p>
                            <p>ราคาการประมูล <strong>{winner.bidValue}</strong> coins</p>
                            <p>เวลา {new Date(winner.time).toLocaleString()}</p>
                        </div>
                    ) : (
                        (new Date() > new Date(checkpoint.start) && new Date() < new Date(checkpoint.end)) && (
                            <div className={style.joinBid}>
                                <button 
                                    className={style.bidButton}
                                    onClick={() => navigate(`/auction/${table.id}/bidauction/${auctionId}`)}
                                >
                                    เข้าร่วมการประมูล
                                </button>
                            </div>
                        )
                    )}
                    
                </div>
            )}
        </div>
    )    
}

export default BidCard;
