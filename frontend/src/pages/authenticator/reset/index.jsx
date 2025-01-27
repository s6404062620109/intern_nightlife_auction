import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/reset.module.css'



function Reset() {
  const [ email, setEmail ] = useState('');
  const [ message, setMessage ] = useState("");

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

        <div className={style["nav-member-wrap"]}>
          <Link to='/signin'>Do you already have an account?</Link>
        </div>
      </div>
    </div>
  )
}

export default Reset