import React, { useEffect, useState } from "react";

import style from "./css/profile.module.css";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";

function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    coin: null,
    profileImg: null,
    payment_method: [],
  });
  const [bidData, setBidData] = useState([]);
  const [imgPath, setImgPath] = useState(``);
  const navigate = useNavigate();

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
            profileImg: userData.profileImg,
            payment_method: userData.payment_method,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    autherization();
  }, []);

  useEffect(() => {
    const fetchProfileImg = async () => {
      try {
        const response = await backend.get(
          `/img/getUserProfile/${user.id}/${user.profileImg}`
        );

        if (response.status === 200) {
          setImgPath(response.data.url);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfileImg();

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
  }, [user.id, user.profileImg]);

  return (
    <div className={style.container}>
      <div className={style["content-wrap"]}>
        <div className={style.content}>
          <div className={style.head}>
            {user.profileImg !== null ? (
              <img alt="User profile img" src={imgPath} />
            ) : (
              <img alt="User profile img" src="/User_cicrle.svg" />
            )}
            <div className={style.title}>
              <h1>Name : {user.name}</h1>
            </div>
          </div>

          <div className={style.body}>
            
            <div className={style["user-info"]}>
                <h2>Money : {user.coin} coins</h2>
                <h3>Email : {user.email}</h3>
                <h3>
                    Password : 
                    <button onClick={() => navigate('/reset')}>Change Password</button>
                </h3>
                
                <div className={style["BidHistory-count"]}>
                    <p>เข้าร่วมการประมูลอยู่ {bidData.length} สถานที่ </p>
                    
                </div>
            </div>

            <div className={style["payment-methods"]}>
              {user.payment_method.length > 0 ? (
                <div>
                  <table>
                    <thead>
                      <th>ธนาคาร/วิธีชำระเงิน</th>
                      <th>รหัสบัญชีธนาคาร</th>
                    </thead>

                    <tbody>
                      {user.payment_method.map((payment) => (
                        <tr>
                          <td>{payment.name}</td>
                          <td>{payment.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>Not have payment method now.</div>
              )}

              <div className={style["add-payment-method"]}>
                <button>เพิ่มวิธีการชำระเงิน</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
