import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function WelcomeResetPassword() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) return setError(t("passwordTooShort"));
    if (password !== confirm) return setError(t("passwordsDontMatch"));
    if (!token) return setError(t("missingToken"));

    try {
      await api.post("users/reset-password/", {
        token,
        new_password: password,
      });
      toast.success(t("passwordUpdated"));
      navigate("/dashboard-etu");
    } catch (err) {
      setError(err.response?.data?.error || t("updateError"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grad-5 px-4">
      <div className="bg-card shadow-card rounded-2xl w-full max-w-md p-8 animate-slide-in">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-primary-light flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-muted">
            {t("welcome")}
          </h1>
          <p className="text-sm text-gray text-center mt-1">
            {t("setNewPassword")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted">
              {t("newPassword")}
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-light bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-light bg-white dark:bg-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="********"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red flex items-center gap-2">
              • {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-grad-1 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <CheckCircle size={18} />
            {t("confirm")}
          </button>
        </form>
      </div>
    </div>
  );
}
