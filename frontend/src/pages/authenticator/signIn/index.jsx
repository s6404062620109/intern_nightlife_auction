import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import style from './css/signin.module.css'

function SignIn() {
  const [ userData, setUsetData ] = useState({
    email:"", password:""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(userData);
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
              />
            </div>

            <div>
              <label>PASSWORD</label>
              <input
                type='password'
                placeholder='PASSWORD'
                value={userData.password}
                onChange={(e) => setUsetData({...userData, password: e.target.value})}
              />
            </div>
          </div>

          <div className={style["input-footer"]}>
            <input type='submit' value='Sign In'/>
            <label>Status</label> 
          </div>
          
        </form>

        <div>
          <Link to='/signup'>Don’t have an account?</Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn