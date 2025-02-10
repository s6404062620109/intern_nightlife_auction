import React, { useEffect, useState } from "react";
import backend from "../../api/backend";

import style from "./css/bidhistory.module.css";
import BidCard from "../../components/BidCard";

function bidHistory() {
  const [user, setUser] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    coin: null,
  });
  const [bidData, setBidData] = useState([]);

  useEffect(() => {
    const autherization = async () => {
      try {
        const response = await backend.get("/auth/authorization", {
          withCredentials: true,
        });

        if (response.status === 200) {
          const userData = response.data;

          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            coin: userData.coin,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    autherization();
  }, []);

  useEffect(() => {
    const fetchBidHistory = async () => {
      if (!user.id) return;

      try {
        const response = await backend.get(`/bid/readJoinAuctions/${user.id}`);

        if (response.status === 200) {
          setBidData(response.data.auctions);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBidHistory();
  }, [user.id]);

  return (
    <div className={style.container}>
      <div className={style["content-wrap"]}>
        <h1>Bid History</h1>
        <div className={style.content}>
          {bidData.length > 0 ? (
            bidData.map((bid, index) => (
              <BidCard
                key={index}
                name={bid.venue.name}
                address={bid.venue.address}
                banner={bid.venue.banner}
                checkpoint={bid.auctionDetails.checkpoint}
                accessTime={bid.auctionDetails.accesstime}
                table={bid.table}
                winner={bid.auctionDetails.winner}
                bidValue={bid.bidValue}
                bidTime={bid.bidTime}
              />
            ))
          ) : (
            <p>No bid history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default bidHistory;
