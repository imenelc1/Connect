import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";

export default function NavLinks() {
  return (
   <ul className="flex items-center space-x-8 text-[var(--color-text-main)] font-medium">
  <li>
    <a href="/" className="text-[var(--color-text-main) hover:opacity-80  transition]">
      Home
    </a>
  </li>
  <li>
    <a href="#impact" className="text-[var(--color-text-main)] hover:opacity-80  transition ">Impact</a>
  </li>
  <li>
    <a href="#services" className="text-[var(--color-text-main)] hover:opacity-80  transition">Services</a>
  </li>

  {/* toggle theme */}
  <li className="cursor-pointer text-[var(--color-text-main)] hover:opacity-80  transitions">
    <FiSun size={18} />
  </li>
  <li className="cursor-pointer text-[var(--color-text-main)] hover:opacity-80  transition">
  <MdTranslate size={18} title="Changer la langue" />
</li>
</ul>




  );
}