import React from 'react';
import { FcGoogle } from "react-icons/fc";
const Button = ({children,type="button",variant="primary",onClick}) => {
    const base = "w-full rounded-full py-2 px-4 text-sm font-medium transition";
    const styles = {
    primary: `${base} bg-sky-500 text-white hover:bg-sky-600`,
    outline: `${base} border border-gray-200 bg-white text-gray-700 hover:shadow`
  };
  return (
   <button type={type} onClick={onClick} className={styles[variant]}>
    {children}
   </button> 
  );
};

export default Button;