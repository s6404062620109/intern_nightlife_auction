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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
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
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("profileImg", selectedFile);

    try {
        const response = await backend.post(
            `/img/upload/userProfile/${user.id}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        if (response.status === 200) {
            // Update the user state with the new profile image
            setUser((prevUser) => ({
                ...prevUser,
                profileImg: response.data.url.split("/").pop(), // Extract filename from URL
            }));
            setImgPath(response.data.url);
            setSelectedFile(null);
            setPreviewImg(null);
        }
    } catch (error) {
        console.log("Upload failed:", error);
        alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className={style.container}>
      <div className={style["content-wrap"]}>
        <div className={style.content}>
        <div className={style.head}>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <img
              alt="User profile"
              src={previewImg || (user.profileImg ? imgPath : "/User_cicrle.svg")}
              onClick={() => document.getElementById("fileInput").click()}
              style={{ cursor: "pointer" }}
            />
            <div className={style.title}>
              <h1>{user.name}</h1>
            </div>

            {previewImg && (
              <div className={style.uploadPreview}>
                <button onClick={handleUpload}>Upload Image</button>
              </div>
            )}
          </div>          

          <div className={style.body}>
            
            <div className={style["user-info"]}>
                <div className={style["money-action"]}>
                  <h2>Money : {user.coin} coins</h2>
                  <button>เติมเงิน</button>
                </div>
                
                <div className={style["info-action"]}>
                  <h3>Email : {user.email}</h3>
                  
                  <div className={style["password-wrap"]}>
                    <h3>Password</h3>
                    
                    <button onClick={() => navigate('/reset')}>เปลี่ยนรหัสผ่าน</button>
                  </div>
                  
                </div>
                
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
                      <th>เลขบัญชีธนาคาร</th>
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
