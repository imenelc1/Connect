import React from "react";
import Logo from "./logo";
import Button from "./Button";
import NavLinks from "./NavLinks";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center space-x-8">
    <NavLinks />
    <Button text="Create Account" variant="ca" />

  </div>
     
    </nav>
  );
}