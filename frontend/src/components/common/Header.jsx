import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext.jsx";
import LogoComponent from "./LogoComponent.jsx";
import HeaderLinks from "./HeaderLinks.jsx";
import Button from "./Button.jsx";
export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between sm:px-6 lg:px-12 py-2 w-full">

      <LogoComponent className="ml-0 md:-ml-8" />

      <div className="flex items-center space-x-4">
        <HeaderLinks />

        {!user ? (
          <Button text="Create Account" variant="ca" />
        ) : (
          <button onClick={logout} className="text-red font-medium">
            Logout ({user.username})
          </button>
        )}
      </div>

    </nav>
  );
}