import React from "react";
import Navbar from "../common/Navbar";
import Text from "../common/Text";
import Icon from "../common/Icon";
import "../../styles/index.css";
import Button from "../common/button";

export default function Header() {
  return (
    <header className="min-h-screen flex flex-col justify-between px-8 py-0 md:px-16">
      <Navbar />
        
      <div className="flex flex-col md:flex-row items-center justify-between mt-20 md:mt-32">
        <div className="max-w-xl space-y-6">
          <Text />
            
          <div className="flex space-x-4">
            <Button className="  px-12 py-2 rounded-xl font-medium shadow hover:opacity-90 transition ">
            Get Started
            </Button>

           <Button className=" border border-[var(--color-primary)] text-[var(--color-primary)] bg-white px-12 py-2 rounded-xl font-medium hover:bg-[var(--color-bg)] transition ">
            how it works
           </Button > 
          </div>
     
        </div>

        <Icon />
      </div>
    </header>
  );
}