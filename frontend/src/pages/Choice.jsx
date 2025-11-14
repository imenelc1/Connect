import React from 'react';
import { GraduationCap, UserRound } from "lucide-react";
import Icon from '../components/common/Icon';
import Logo from '../components/common/logo';
import Button from '../components/common/button';
import Footer from '../components/layout/Footer';

function Choice() {
    return (

        <div className="Choice flex flex-col min-h-screen">


            <header className="mt-10 ml-10">
                <Logo className="w-20 h-30" />
            </header>


            <main className="flex flex-col gap-10 items-center justify-center flex-grow text-center">
                <Icon />
                <p className='font-poppins text-2xl'>
                    To Personalize your experience, please indicate <br /> your profile.
                </p>

                <div className="flex gap-20">
                    <Button className="shadow-md px-9 py-5 rounded-3xl font-bold  font-poppins text-2xl hover:opacity-90 flex w-64 items-center justify-center gap-3">
                        <UserRound size={40} />
                        Instructor
                   
                     </Button>
                    <Button className="shadow-md px-9 py-5 rounded-3xl font-bold font-poppins text-2xl hover:opacity-90 flex w-64 items-center justify-center gap-3">
                        <GraduationCap size={40} />
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