'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
  loggedIn: boolean;
  userName: string;
  userId: string;
  loading: boolean;
  handleLogin: (name: string, id: string) => void;
  handleLogout: () => void;
}

const UserContext = createContext<UserContextType>({
  loggedIn: false,
  userName: '',
  userId: '',
  loading: true,
  handleLogin: () => {},
  handleLogout: () => {},
});

const STORAGE_KEY_NAME = 'kanjikantan_userName';
const STORAGE_KEY_ID = 'kanjikantan_userId';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEY_NAME);
    const storedId = localStorage.getItem(STORAGE_KEY_ID);
    if (storedName && storedId) {
      setUserName(storedName);
      setUserId(storedId);
      setLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (name: string, id: string) => {
    localStorage.setItem(STORAGE_KEY_NAME, name);
    localStorage.setItem(STORAGE_KEY_ID, id);
    setUserName(name);
    setUserId(id);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_NAME);
    localStorage.removeItem(STORAGE_KEY_ID);
    setUserName('');
    setUserId('');
    setLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{ loggedIn, userName, userId, loading, handleLogin, handleLogout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
