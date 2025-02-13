import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '../api/backend';

import style from './css/navbar.module.css';

function Navbar() {
    const [user, setUser] = useState({
      id: null,
      email: null,
      name: null,
      role: null,
      coin: null,
      profileImg: null,
      payment_method: [],
    });
    const [ showOption, setShowOption ] = useState(false);
     const [imgPath, setImgPath] = useState(``);
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
              coin: userData.coin,
              profileImg: userData.profileImg,
              payment_method: userData.payment_method
            });
          }
    
          } catch (error) {
            console.log(error);
          }
      }
      autherization();
    }, []);

    useEffect(() => {
      const fetchProfileImg = async () => {
          try{
              const response = await backend.get(`/img/getUserProfile/${user.id}/${user.profileImg}`);

              if(response.status === 200){
                  setImgPath(response.data.url);
              }
          }
          catch(error) {
              console.log(error);
          }
      }

      fetchProfileImg();
    },[user.profileImg]);

    const handleLogout = async () => {
      try {
        const response = await backend.post('/auth/logout', {}, { withCredentials: true });
  
        if (response.status === 200) {
          setUser({
            id: null,
            email: null,
            name: null,
            role: null,
            coin: null,
          });
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

  return (
    <nav>
        <div className={style["wrap"]}>
            <img
                alt='Home Icon'
                src='/NightLife_logo_1.png'
                onClick={() => navigate('/')}
            />

            <div className={style["link-wrap"]}
                onClick={() => navigate('/venue')}
            >
                <p>Venue</p>
            </div>

            {user.name ? (
                <div className={style["user-info"]}
                  onClick={() => setShowOption(!showOption)}
                >
                    <div className={style["user-box"]}>
                      <div className={style["user-wrap"]}>
                        <p>
                          <strong>{user.coin}</strong>
                          <label>
                            Coins
                          </label>
                        </p>
                        <p>{user.name}</p>
                      </div>
                      
                      {user.profileImg !== null ? (
                        <img
                          alt='User profile img'
                          src={imgPath}
                        />
                      ) : (
                        <img
                          alt='User profile img'
                          src='/User_cicrle.svg'
                        />
                      )}
                      
                    </div>
                    
                    { showOption && (
                      <ul className={style["user-option-wrap"]}>
                        <li onClick={() => navigate('/myvenue')}>
                          My Venue
                        </li>
                        <li onClick={() => navigate(`/bidhistory`)}>
                          Bid History
                        </li>
                        <li onClick={() => navigate(`/profile/${user.id}`)}>
                          Profile
                        </li>
                        <li onClick={handleLogout}>
                          log out
                        </li>
                      </ul>
                    )}
                </div>
            ):(
                <div className={style["link-wrap"]}
                onClick={() => navigate('/signin')}
                >
                    <p>Sign in</p>
                </div>
            )}
            
        </div>
    </nav>
  )
}

export default Navbar