import React from 'react'
import { createContext, useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const dotenv = require("dotenv");
dotenv.config();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loadIngred, setLoadIngred] = useState(0);
  const [loadFav, setLoadFav] = useState(0);
  const navigate = useNavigate();

  const handleRegister = async (user) => {
    const response = await axios.post(`https://cookmyfridge-backend.azurewebsites.net/register`, user);
    const token = response.data['token']
    setToken(token);

    
    //store in cookies
    document.cookie = `token=${token}`;
    navigate('/');
  };

  const set_loadIngred = () => {
    setLoadIngred(1);
  }

  const set_loadFav = () => {
    setLoadFav(1);
  }

  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );  

  const to_save = async () => {
    navigate('/services/ingredients');
    await delay(100);
    navigate('/services/saved_recipes');
  } 

  const handleLogin = async (user) => {
    console.log("In Login");

    try{
      const response = await axios.post(`https://cookmyfridge-backend.azurewebsites.net/login`, user);
      if (response.status === 201){
          const token = response.data['token'];
          setToken(token);
          //store in cookies
          document.cookie = `token=${token}`;
          navigate('/');
          return false;
      }
    }

    catch {
      return true;
    }
  }

  const handleLogout = () => {
    setToken(null);
  };

  const value = {
    token,
    loadIngred,
    loadFav,
    toSave: to_save,
    setLoadIngred: set_loadIngred,
    setLoadFav: set_loadFav,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onRegister: handleRegister
  };

  return (
    <AuthContext.Provider value={{Auth : value}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);