import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";

export default function HeaderLinks() {
  return (
   <ul className="flex items-center space-x-8 text-textc font-medium">
  <li>
    <a href="/" className="text-textc hover:opacity-80  transition]">
      Home
    </a>
  </li>
  <li>
    <a href="#Features" className="text-textc hover:opacity-80  transition ">About</a>
  </li>
  <li>
    <a href="#Features" className="text-textc hover:opacity-80  transition">Features</a>
  </li>

  {/* toggle theme */}
  <li className="cursor-pointer text-textc hover:opacity-80  transitions">
    <FiSun size={20} />
  </li>
  <li className="cursor-pointer text-textc hover:opacity-80  transition">
  <MdTranslate size={20} title="Changer la langue" />
</li>
</ul>




  );
}
