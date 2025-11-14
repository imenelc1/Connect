import React, { useState } from "react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import googleIcon from "../assets/google-icon.svg";

const Signup = () => {
  const [formData, setFormData] = useState({
    nickname: "",
    fullname: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    regnumber: "",
    field: "",
    year: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log("Envoi au backend :", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8"
         style={{
           background: "radial-gradient(ellipse at 68% 54%, #e1f3fe 50%, #f7fbff 95%)"
         }}>
      
      {/* Header flottant */}
      <div className="w-full max-w-6xl flex items-center px-6 pt-5 pb-2 mb-2">
        <img src={logo} alt="Connect Logo" className="w-36 h-auto" />
        <div className="flex-1 flex justify-center">
          <AuthTabs active="signup" />
        </div>
      </div>
      
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden"
           style={{ boxShadow: '0 6px 48px 0 rgba(52,144,220,.12)' }}>
        {/* Formulaire (gauche) */}
        <div className="flex-1 p-10">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Welcome to <span className="text-sky-500">connect</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Enter your nickname" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Full name" />
              <Input label="Enter your name" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Full name" />
            </div>
            <Input label="Enter your Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" />
            <Input label="Enter your Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />
            <Input label="Confirm your password" name="confirm" type="password" value={formData.confirm} onChange={handleChange} placeholder="Confirmed password" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Enter your date of birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of birth" />
              <Input label="Enter your registration number" name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder="Registration number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Enter your field of study" name="field" value={formData.field} onChange={handleChange} placeholder="Field of study" />
              <Input label="Enter your academic year" name="year" value={formData.year} onChange={handleChange} placeholder="Academic year" />
            </div>
            <div className="text-center text-gray-400">Or</div>
            <Button variant="outline">
              <img src={googleIcon} alt="google" className="inline-block w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button type="submit">Sign up</Button>
            <p className="text-sm text-gray-500 text-center">
              Already have an account? <a href="#" className="text-sky-500">Sign in</a>
            </p>
          </form>
        </div>
        {/* Mascotte (droite) */}
        <div className="flex-1 flex items-center justify-center relative"
             style={{
               background: "radial-gradient(circle at 57% 62%, #e0f3fd 60%, transparent 100%)"
             }}>
          <div className="absolute top-10 right-12 bg-white rounded-lg shadow px-6 py-3 text-sm font-medium">
            Join CONNECT, dear student !
          </div>
          <img src={robot} alt="robot" className="max-w-xs md:max-w-md drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
