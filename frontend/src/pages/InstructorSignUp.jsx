import React, { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import googleIcon from "../assets/google-icon.svg";
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaIdBadge, FaStar, FaPaperPlane, FaEye, FaEyeSlash } from "react-icons/fa";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <div className="min-h-screen bg-[#f5f9fd] flex flex-col">
      {/* Logo tout en haut à gauche */}
      <div className="px-6 pt-6">
        <img src={logo} alt="Connect Logo" className="w-28 md:w-36 h-auto" />
      </div>

      {/* Onglets Sign In / Sign Up centrés */}
      <div className="flex justify-center mt-4">
        <AuthTabs active="signup" />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center mt-8 px-6">
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">
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

              <Input
                label="Enter your Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                icon={<FaLock />}
                rightIcon={showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" /> : <FaEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />}
              />

              <Input
                label="Confirm your password"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                value={formData.confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                icon={<FaLock />}
                rightIcon={showConfirm ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" /> : <FaEye onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Enter your date of birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of birth" icon={<FaCalendarAlt />} />
                <Input label="Enter your registration number" name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder="Registration number" icon={<FaIdBadge />} />
              </div>

              <Input label="Enter your rank" name="rank" value={formData.rank} onChange={handleChange} placeholder="Rank" icon={<FaStar />} />

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

          <div className="flex-1 flex items-center justify-center relative bg-white overflow-hidden">
            <div className="absolute w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(52,144,220,0.6)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            <img src={robot} alt="robot" className="max-w-xs md:max-w-md drop-shadow-lg relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSignup;
