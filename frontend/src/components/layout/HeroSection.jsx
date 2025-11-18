import React from "react";
import Header from "../common/Header";
import Text from "../common/Text";
import Icon from "../common/Icon";
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


import "../../styles/index.css";
import Button from "../common/Button";

export default function HeroSection() {
  const navigate = useNavigate();
  return (

    <header className="bg-[var(--color-bg)] min-h-[90vh] flex flex-col  px-8 py-0 md:px-16">
      <Header />
        
      <div className="flex flex-col md:flex-row items-center justify-between mt-15 md:mt-20">
        <div className="max-w-xl space-y-6">
          <Text />
            
          <div className="flex space-x-4">
            <Button 
              variant="heroPrimary"
              onClick={() => navigate("/choice")}
            >
              <FaPaperPlane className="text-white text-lg" size={16} />
              Get Started
            </Button>

              <Button variant="heroOutline">
                how it works
              </Button>

          </div>
     
        </div>

        <Icon />
      </div>
    </header>
  );
}
