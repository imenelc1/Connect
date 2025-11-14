import React, { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import googleIcon from "../assets/google-icon.svg";
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaIdBadge, FaStar, FaPaperPlane } from "react-icons/fa";

const InstructorSignup = () => {
  const [formData, setFormData] = useState({
    nickname: "",
    fullname: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    regnumber: "",
    rank: ""
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log("Instructor signup submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden" style={{ backgroundColor: "#f5f9fd" }}>
      {/* Header */}
      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl flex items-center px-6 pt-5 pb-2 mb-2">
        <img src={logo} alt="Connect Logo" className="w-36 h-auto" />
        <div className="flex-1 flex justify-center">
          <AuthTabs active="signup" />
        </div>
      </div>

      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden" style={{ boxShadow: "0 6px 48px 0 rgba(52,144,220,.12)" }}>
        {/* Formulaire */}
        <div className="flex-1 p-10 bg-white">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Welcome to <span className="text-sky-500">connect</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Enter your nickname" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Nickname" icon={<FaUser />} />
              <Input label="Enter your full name" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Full name" icon={<FaUser />} />
            </div>

            <Input label="Enter your Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" icon={<FaEnvelope />} />
            <Input label="Enter your Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" icon={<FaLock />} />
            <Input label="Confirm your password" name="confirm" type="password" value={formData.confirm} onChange={handleChange} placeholder="Confirm password" icon={<FaLock />} />
            <Input label="Enter your date of birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of birth" icon={<FaCalendarAlt />} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Enter your registration number" name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder="Registration number" icon={<FaIdBadge />} />
              <Input label="Enter your rank" name="rank" value={formData.rank} onChange={handleChange} placeholder="Rank" icon={<FaStar />} />
            </div>

            <div className="text-center text-gray-400">Or</div>

            <Button variant="outline">
              <img src={googleIcon} alt="google" className="inline-block w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button type="submit">
              <FaPaperPlane className="inline mr-2" /> Sign up
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account? <a href="#" className="text-sky-500">Sign in</a>
            </p>
          </form>
        </div>

        {/* Mascotte */}
        <div className="flex-1 flex items-center justify-center relative bg-white overflow-hidden">
          {/* Halo bleu */}
          <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full blur-2xl" style={{ background: "rgba(52,144,220,0.6)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

          {/* Cercle < > collé au rectangle */}
          <div
            className="absolute w-12 h-12 rounded-full flex items-center justify-center z-20"
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid rgba(0,0,0,0.13)",
              top: "50px",
              right: "40px"
            }}
          >
            <span style={{ color: "#3490DC", fontSize: "22px", fontWeight: "bold" }}>&lt;&gt;</span>
          </div>

          {/* Rectangle */}
          <div className="absolute z-10" style={{ top: "70px", right: "40px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="175" viewBox="0 0 331 193" fill="none">
              <g filter="url(#filter0_dd)">
                <path d="M11 22C11 13.7157 17.7157 7 26 7H304.372C312.656 7 319.372 13.7157 319.372 22V162.204C319.372 170.488 312.656 177.204 304.372 177.204H26C17.7157 177.204 11 170.488 11 162.204V22Z" fill="white" fillOpacity="0.97"/>
                <path d="M26 7.5H304.372C312.38 7.50008 318.872 13.9919 318.872 22V162.204C318.872 170.212 312.38 176.704 304.372 176.704H26C17.9919 176.704 11.5 170.212 11.5 162.204V22C11.5 13.9919 17.9919 7.5 26 7.5Z" stroke="black" strokeOpacity="0.13"/>
              </g>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="500" fill="#000">
                Join CONNECT, dear Instructor!
              </text>
            </svg>
          </div>

          {/* Mascotte */}
          <img src={robot} alt="robot"   className="max-w-[180px] md:max-w-[260px] drop-shadow-lg relative z-10"
 />
        </div>
      </div>
    </div>
  );
};

export default InstructorSignup;
