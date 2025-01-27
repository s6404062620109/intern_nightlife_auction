import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/changepassword.module.css';

function ChangePassword() {
    const [ password, setPassword ] = useState({
        raw: '', confirm: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        if(!token){
            alert("Please request reset password token complete.");
            navigate('/reset');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(password.raw !== password.confirm){
            setMessage("Please provide the same password to confirm your password.");
            return;
        }
    
        try {
          const response = await backend.post('/auth/change-password', { token, newPassword: password.raw });
    
          if (response.status === 200) {
            setMessage(response.data.message);
            setTimeout(() => navigate('/signin'), 2000);
          }
        } catch (error) {
          console.log(error.response);
          if (error.response.status === 400) {
            setMessage(error.response.data.message);
          }
        }
    };

  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        <div className={style.head}>Set New Password</div>
        
        <form onSubmit={handleSubmit}>
          <div className={style["input-body"]}>
            <div>
              <label>PASSWORD</label>
              <input
                type='password'
                placeholder='PASSWORD'
                value={password.raw}
                onChange={(e) => setPassword({...password, raw: e.target.value})}
                required
              />
            </div>

            <div>
              <label>CONFIRM PASSWORD</label>
              <input
                type='password'
                placeholder='CONFIRM PASSWORD'
                value={password.confirm}
                onChange={(e) => setPassword({...password, confirm: e.target.value})}
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

export default ChangePassword