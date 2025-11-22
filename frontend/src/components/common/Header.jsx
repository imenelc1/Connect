import React from "react";
import LogoComponent from "./LogoComponent";
import Button from "./Button";
import HeaderLinks from "./HeaderLinks";

export default function Header() {
  return (
    <nav className="flex items-center justify-between sm:px-6 lg:px-12 py-2 w-full">
      <LogoComponent />
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
    <HeaderLinks />
    <Button text="Create Account" variant="ca" />

  </div>
     
    </nav>
  );
}
