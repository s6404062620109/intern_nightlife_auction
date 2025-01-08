import React, { useState } from "react";
import { Link } from "react-router-dom";
import backend from '../../../api/backend';

import style from "./css/signup.module.css";

function SignUp() {
  const [userData, setUsetData] = useState({
    email: "",
    password: "",
    cpassword: "",
    name: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userData.password !== userData.cpassword) {
      alert("Password not matching!");
      
    } 
    else {
      const postUserData = async () =>{
        try{
          const response = await backend.post('/auth/register', {
            email: userData.email,
            password: userData.password,
            name: userData.name
          });

          if(response.status === 201){
            setMessage(response.data.message);
          }
        } catch (error){
          console.log(error.response);
          if(error.response.status === 400){
            setMessage(error.response.data.message);
          }
        }
      }
      
      postUserData();
    }
  };
  return (
    <div className={style.container}>
      <div className={style["container-wrap"]}>
        <div className={style.head}>Sign Up</div>

        <form onSubmit={handleSubmit}>
          <div className={style["input-body"]}>
            <div>
              <label>EMAIL</label>
              <input
                type="email"
                placeholder="EMAIL"
                value={userData.email}
                onChange={(e) =>
                  setUsetData({ ...userData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>PASSWORD</label>
              <input
                type="password"
                placeholder="PASSWORD"
                value={userData.password}
                onChange={(e) =>
                  setUsetData({ ...userData, password: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>CONFIRM PASSWORD</label>
              <input
                type="password"
                placeholder="PASSWORD"
                value={userData.cpassword}
                onChange={(e) =>
                  setUsetData({ ...userData, cpassword: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>NAME</label>
              <input
                type="text"
                placeholder="NAME"
                value={userData.name}
                onChange={(e) =>
                  setUsetData({ ...userData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className={style["input-footer"]}>
            <input type="submit" value="Sign Up" />
            <label>{message}</label>
          </div>
        </form>

        <div>
          <Link to="/signin">Do you already have an account ?</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
