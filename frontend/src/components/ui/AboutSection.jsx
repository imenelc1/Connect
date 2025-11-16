import React from "react";
import { GiAbstract013 } from "react-icons/gi";
import { AiOutlineHeart, AiOutlineBulb } from "react-icons/ai";

export default function AboutSection() {
  return (
    <div className="about-container w-full px-8 md:px-16 py-6 flex flex-col md:flex-row justify-between gap-20 font-poppins bg-[var(--color-bg)]">
      {/* LEFT SIDE */}
      <div className="about-content flex flex-col gap-3 md:gap-10 w-full md:w-1/2">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#4F9DDE] via-[#2F4F70] to-[#2F4F70] bg-clip-text text-transparent">
          About CONNECT
        </h1>

        <p className="about-text text-[var(--color-text-main)] text-[1.05rem] w-[70%] leading-relaxed mb-0.5 font-normal">
          Founded in 2025, CONNECT was created by software engineers passionate about
          making programming education accessible and effective for everyone.
        </p>

        <p className="about-text text-[var(--color-text-main)] text-[1.05rem] w-[70%] leading-relaxed mb-2 font-normal">
          We believe that learning to code should be engaging, interactive, and personalized.
          Our platform combines cutting-edge educational technology with proven teaching
          methods to create an unparalleled learning experience.
        </p>

        <p className="about-text text-[var(--color-text-main)] text-[1.05rem] w-[70%] leading-relaxed mb-2 font-normal">
          With thousands of students and educators using our platform daily, we're committed
          to continuously improving and expanding our offerings to meet the evolving needs
          of the programming education community.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="mission-values flex flex-col gap-10 w-full md:w-1/2 mt-10">
        {/* MISSION */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <GiAbstract013 size={40} color="#c399d2" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-[var(--color-text-main)] leading-relaxed w-[85%]">
              To empower the next generation of programmers with the skills and confidence
              they need to succeed in the digital world.
            </p>
          </div>
        </section>

        {/* VALUES */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <AiOutlineHeart size={40} color="#c399d2" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
              Our Values
            </h2>
            <p className="text-lg text-[var(--color-text-main)] leading-relaxed w-[85%]">
              Excellence in education, inclusivity, innovation, and a student-first
              approach guide everything we do.
            </p>
          </div>
        </section>

        {/* VISION */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <AiOutlineBulb size={40} color="#c399d2" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
              Our Vision
            </h2>
            <p className="text-lg text-[var(--color-text-main)] leading-relaxed w-[85%]">
              A world where quality programming education is accessible to everyone,
              regardless of background or location.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
