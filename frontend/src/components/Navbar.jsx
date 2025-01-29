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
      coin: null
    });
    const [ showOption, setShowOption ] = useState(false);
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
              coin: userData.coin
            });
          }
    
          } catch (error) {
            console.log(error);
          }
      }
      autherization();
    }, []);

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
                    <p>{user.name}</p>
                    { showOption && (
                      <ul className={style["user-option-wrap"]}>
                        <li>
                          My Auction
                        </li>
                        <li>
                          Bid History
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