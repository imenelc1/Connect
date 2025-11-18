import React from 'react';
import { GraduationCap, UserRound } from "lucide-react";
import Icon from '../components/common/Icon';
import Logo from '../components/common/logo';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import "../styles/index.css";
import { useNavigate } from "react-router-dom";
function Choice() {
    const navigate = useNavigate();
    return (

   <div className="Choice flex flex-col h-screen bg-[radial-gradient(circle_at_center,_#bad7f0,_#ffffff)]">

    <header className="p-6">
        <Logo className="w-20 h-30" />
    </header>

    <main className="flex flex-col items-center justify-center flex-1 
                    gap-8 text-center px-4">
        
        <Icon />

        <p className="font-poppins text-xl sm:text-2xl md:text-3xl text-[#a5a5a5]">
            To Personalize your experience, please indicate <br /> your profile.
        </p>

        <div className="flex gap-10 md:gap-16">
            <Button variant="choice" onClick={() => navigate("/signup/instructor")}>
                <UserRound size={24} />
                Instructor
            </Button>

           
            <Button variant="choice" onClick={() => navigate("/signup/student")}>
                <GraduationCap size={24} />
                Student
            </Button>
        </div>
    </main>

    <Footer />
</div>

    );
}

export default Choice;
