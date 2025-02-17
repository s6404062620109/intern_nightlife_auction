import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/reset.module.css'



function Reset() {
  const [user, setUser] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    coin: null,
    profileImg: null,
    payment_method: [],
  });
  const [ email, setEmail ] = useState('');
  const [ message, setMessage ] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await backend.post('/auth/reset-password', {
        email: email,
      });

      if(response.status === 200){
        setMessage(response.data.message);
      }
    }
    catch (error) {
      console.log(error.response);
      if(error.response.status === 400){
        setMessage(error.response.data.message);
      }
    }
  }

  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        <div className={style.head}>Reset Password</div>
        
        <form onSubmit={handleSubmit}>
          <div className={style["input-body"]}>
            <div>
              <label>EMAIL</label>
              <input
                type='email'
                placeholder='EMAIL'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

          </div>

          <div className={style["input-footer"]}>
            <input type='submit' value='Confirm Reset Password'/>
            <label>{message}</label> 
          </div>
          
        </form>
        
        {!user.id && !user.email && (
          <div className={style["nav-member-wrap"]}>
            <Link to='/signin'>Do you already have an account?</Link>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default Reset