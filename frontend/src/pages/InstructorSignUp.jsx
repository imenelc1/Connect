import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPaperPlane, FaEye, FaEyeSlash, FaCalendarAlt, FaIdBadge, FaGraduationCap } from "react-icons/fa";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthTabs from "../components/common/AuthTabs";
import GoogleButton from "../components/common/GoogleButton";
import logo from "../assets/LogoLight.svg";
import robot from "../assets/mascotte.svg";
import api from "../services/api";
import toast from "react-hot-toast";

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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nickname) newErrors.nickname = "Champ obligatoire";
    if (!formData.fullname) newErrors.fullname = "Champ obligatoire";
    if (!formData.email) newErrors.email = "Email obligatoire";
    if (!formData.password) newErrors.password = "Mot de passe obligatoire";
    if (formData.password.length < 8) newErrors.password = "Minimum 8 caractères";
    if (formData.confirm !== formData.password) newErrors.confirm = "Mot de passe non identique";
    if (!formData.dob) newErrors.dob = "Champ obligatoire";
    if (!formData.regnumber) newErrors.regnumber = "Champ obligatoire";
    if (!formData.rank) newErrors.rank = "Champ obligatoire";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs.");
      return;
    }

    const payload = {
      nom: formData.nickname,
      prenom: formData.fullname,
      adresse_email: formData.email,
      mot_de_passe: formData.password,
      date_naissance: formData.dob,
      matricule: formData.regnumber,
      grade: formData.rank,
      role: "instructor",
    };

    try {
      await api.post("register/", payload);
      toast.success("Inscription réussie !");
      setTimeout(() => (window.location.href = "/dashboard-instructor"), 1500);
    } catch (err) {
      const backend = err.response?.data;
      const newErrors = {};
      if (backend?.adresse_email) newErrors.email = backend.adresse_email[0];
      if (backend?.matricule) newErrors.regnumber = backend.matricule[0];
      if (backend) toast.error(Object.values(backend).flat().join("\n"));
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <img src={logo} alt="Logo" className="w-32" />
      </div>

      {/* Tabs */}
      <AuthTabs role="instructor" active="signup" />

      {/* Conteneur principal */}
      <div className="flex flex-col md:flex-row w-[1000px] max-w-full min-h-[550px] bg-white rounded-3xl shadow-lg overflow-hidden relative pt-12 mx-auto">

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Welcome to <span className="text-[#4F9DDE]">connect</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nickname" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Nickname" icon={<FaUser />} error={errors.nickname} />
              <Input label="Full name" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Full name" icon={<FaUser />} error={errors.fullname} />
            </div>

            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" icon={<FaEnvelope />} error={errors.email} />

            <Input label="Password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Password" icon={<FaLock />} rightIcon={showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" /> : <FaEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />} error={errors.password} />

            <Input label="Confirm Password" name="confirm" type={showConfirm ? "text" : "password"} value={formData.confirm} onChange={handleChange} placeholder="Confirm Password" icon={<FaLock />} rightIcon={showConfirm ? <FaEyeSlash onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" /> : <FaEye onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer" />} error={errors.confirm} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" icon={<FaCalendarAlt />} error={errors.dob} />
              <Input label="Registration Number" name="regnumber" value={formData.regnumber} onChange={handleChange} placeholder="Registration Number" icon={<FaIdBadge />} error={errors.regnumber} />
            </div>

            <Input label="Rank" name="rank" value={formData.rank} onChange={handleChange} placeholder="Rank" icon={<FaGraduationCap />} error={errors.rank} />

            <div className="text-center text-gray-400">Or</div>
            <GoogleButton />
            <Button type="submit" variant="primary">
              <FaPaperPlane className="inline mr-2" /> Sign up
            </Button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Already have an account?{" "}
              <a href="/LoginInstructor" className="text-[#4F9DDE] font-medium hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>

        {/* Mascotte */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center bg-white mt-8 md:mt-0">
          <div className="absolute top-12 md:top-16 right-4 md:right-12 bg-white rounded-xl shadow p-6 md:p-9 w-max min-h-[80px] z-20">
            <p className="text-gray-700 font-medium text-sm">
              Welcome, dear <br /> instructor!
            </p>
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow">
              <span style={{ color: "#4F9DDE", fontSize: "20px", fontWeight: "bold" }}>&lt;&gt;</span>
            </div>
          </div>

          <div className="absolute w-56 md:w-72 h-56 md:h-72 rounded-full blur-3xl"
               style={{ background: "rgba(52,144,220,0.6)", top: "45%", left: "50%", transform: "translate(-50%, -50%)" }} />

          <img src={robot} alt="Robot Mascotte" className="w-56 md:w-72 z-10 -mt-10 md:-mt-10" />
        </div>

      </div>
    </div>
  );
};

export default InstructorSignup;
