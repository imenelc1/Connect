import React from 'react';
import { GraduationCap, UserRound } from "lucide-react";
import Icon from '../components/common/Icon';
import Logo from '../components/common/logo';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import "../styles/index.css";
function Choice() {
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
            <Button className="shadow-md rounded-3xl font-bold font-poppins 
                    text-lg sm:text-xl md:text-2xl hover:opacity-90 
                    flex w-36 sm:w-48 md:w-56 items-center justify-center gap-3 px-10 py-4">
                <UserRound size={24}/>
                Instructor
            </Button>

            <Button className="shadow-md rounded-3xl font-bold font-poppins 
                    text-lg sm:text-xl md:text-2xl hover:opacity-90 
                    flex w-36 sm:w-48 md:w-56 items-center justify-center gap-3 px-10 py-4">
                <GraduationCap size={24}/>
                Student
            </Button>
        </div>
    </main>

    <Footer />
</div>

    );
}

export default Choice;