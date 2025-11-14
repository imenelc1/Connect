import React from 'react';
import { GraduationCap, UserRound } from "lucide-react";
import Icon from '../components/common/Icon';
import Logo from '../components/common/logo';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';
import "../styles/index.css";
function Choice() {
    return (

     <div className="Choice flex flex-col h-screen overflow-hidden bg-[radial-gradient(circle_at_center,_#bad7f0,_#ffffff)]
">


            <header className="p-6">
                <Logo className="w-20 h-30" />
            </header>


            <main className="flex flex-col flex-grow justify-center items-center gap-20 text-center px-4 ">
               
                
                    <Icon   />
                    <p className='font-poppins text-3xl #a5a5a5ff' id='p-choice'>
                        To Personalize your experience, please indicate <br /> your profile.
                    </p>

           


                <div className="flex gap-20">
                     <Button className="shadow-md  rounded-3xl font-bold font-poppins text-3xl hover:opacity-90 flex w-64 items-center justify-center gap-3">
                       <UserRound size={40}/>
                        Instructor
                    </Button>

                    <Button className="shadow-md  px-12 py-8 rounded-3xl font-bold font-poppins text-3xl hover:opacity-90 flex w-64 items-center justify-center gap-3">
                        <GraduationCap size={40}/>
                        Student
                    </Button>
                </div>
            </main>


            <footer className="mt-auto">
                <Footer />
            </footer>
        </div>
    );
}

export default Choice;
