import { useEffect, useState } from 'react';

let currentLocation = '/login';
const listeners: Set<() => void> = new Set();

export const setLocation = (path: string) => {
  currentLocation = path;
  listeners.forEach(listener => listener());
};

export const useLocation = () => {
  const [location, setLocationState] = useState(currentLocation);

  useEffect(() => {
    const listener = () => setLocationState(currentLocation);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return location;
};

export const useNavigate = () => {
  return (path: string) => {
    setLocation(path);
  };
};
