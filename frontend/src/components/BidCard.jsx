import React, { useEffect, useState } from 'react';
import backend from '../api/backend';

import style from './css/bidcard.module.css';

function BidCard({ 
    name, 
    address, 
    banner,
    checkpoint,
    accessTime,
    table,
    winner, 
    bidValue, 
    bidTime 
}) {
    const [ imgPath, setImgPath ] = useState(``);
    const [ hoverCard, setHoverCard ] = useState(false);

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
        <div className={style["card-wrap"]}>
            <div className={style.card}
                onMouseEnter={() => setHoverCard(true)}
                onMouseLeave={() => setHoverCard(false)}
            >
                <img src={imgPath} alt="Venue Banner" className={style.banner} />
                <div className={style.details}>
                    <h2 className={style.name}>{name}</h2>
                    <p className={style.address}>{address}</p>
                    <p className={style.table}>โต๊ะที่ประมูล {table.name} จำนวนที่นั่ง {table.seats} </p>
                    <p className={style.accesstime}>เวลาเข้าใช้ {new Date(accessTime).toLocaleString()}</p>
                    <p className={style.time}>คุณประมูลล่าสุดเมื่อ {new Date(bidTime).toLocaleString()}</p>
                    <p className={style.bid}>เงินประมูลล่าสุดของคุณ <strong>{bidValue}</strong> coins</p>
                    <p className={style.checkpoint}>เวลาประมูล {new Date(checkpoint.start).toLocaleString()} - {new Date(checkpoint.end).toLocaleString()}</p>
                </div>
            </div>
            {hoverCard && winner && (
                <div className={style.winner}>
                    <p>ผู้ชนะการประมูล <strong>{winner.name}</strong></p>
                    <p>ราคาการประมูล <strong>{winner.bidValue}</strong> coins</p>
                    <p>เวลา {new Date(winner.time).toLocaleString()}</p>
                </div>
            )}
        </div>
    )
}

export default BidCard;
