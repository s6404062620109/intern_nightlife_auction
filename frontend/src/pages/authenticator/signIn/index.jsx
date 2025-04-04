import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/signin.module.css'

function SignIn() {
  const [ userData, setUsetData ] = useState({
    email:"", password:""
  });
  const [ message, setMessage ] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await backend.post('/auth/login', {
        email: userData.email,
        password: userData.password

      },{
        withCredentials: true
      });

      if(response.status === 200){
        setMessage(response.data.message);
        setTimeout(() => window.location.href = '/', 2000);
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
        <div className={style.head}>Sign In</div>
        
        <form onSubmit={handleSubmit}>
          <div className={style["input-body"]}>
            <div>
              <label>EMAIL</label>
              <input
                type='email'
                placeholder='EMAIL'
                value={userData.email}
                onChange={(e) => setUsetData({...userData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <label>PASSWORD</label>
              <input
                type='password'
                placeholder='PASSWORD'
                value={userData.password}
                onChange={(e) => setUsetData({...userData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className={style["input-footer"]}>
            <input type='submit' value='Sign In'/>
            <label>{message}</label> 
          </div>
          
        </form>

        <div className={style["nav-member-wrap"]}>
          <Link to='/signup'>Don’t have an account?</Link>
          <Link to='/reset'>Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn