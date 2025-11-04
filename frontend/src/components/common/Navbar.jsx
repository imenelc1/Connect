import React from "react";
import Logo from "./logo";
import NavLinks from "./NavLinks";
import Button from "./ButtonCA";
import ButtonCA from "./ButtonCA";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <NavLinks />
      <ButtonCA />
    </nav>
  );
}
