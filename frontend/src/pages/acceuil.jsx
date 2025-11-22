import React from "react";
import HeroSection from "../components/layout/HeroSection";
import Footer from "../components/layout/Footer"
import Body from "../components/layout/Body";
import LogoComponent from "../components/common/LogoComponent";
import ThemeButton from "../components/common/ThemeButton";
import { useContext } from "react";




export default function Acceuil() {

   
  return (
    <div className="overflow-x-hidden ">
  
      <HeroSection />
       <Body/>
      <Footer />

    </div>
  );
}
