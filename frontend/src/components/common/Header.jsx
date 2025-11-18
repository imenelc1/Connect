import React from "react";
import Logo from "./logo";
import Button from "./Button";
import HeaderLinks from "./HeaderLinks";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center space-x-8">
    <HeaderLinks />
    <Button text="Create Account" variant="ca" />

  </div>
     
    </nav>
  );
}
