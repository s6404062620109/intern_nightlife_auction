import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import style from './css/navbar.module.css';

function Navbar() {
    const navigate = useNavigate();

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

            <div className={style["link-wrap"]}
                onClick={() => navigate('/signin')}
            >
                <p>Sign in</p>
            </div>
        </div>
    </nav>
  )
}

export default Navbar