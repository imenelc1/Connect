import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation("login");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorPassword("");
    setErrorConfirm("");

    if (!password) {
      setErrorPassword(t("errors.passwordRequired"));
      return;
    }
    if (password.length < 8) {
      setErrorPassword(t("errors.passwordLength"));
      return;
    }
    if (confirm !== password) {
      setErrorConfirm(t("errors.passwordMatch"));
      return;
    }

    try {
      const res = await api.post("password/reset/", {
        token,
        new_password: password,
      });

      toast.success(res.data?.message || t("login.passwordUpdated"));
      navigate("/login/student");
    } catch (error) {
      const backend = error.response?.data;

      if (backend?.error) {
        toast.error(backend.error);
        return;
      }

      toast.error(t("login.error"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h2 className="text-xl font-semibold text-center">
          {t("login.resetPassword")}
        </h2>

        <Input
          label={t("login.newPassword")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          icon={<FaLock />}
          error={errorPassword}
        />

        <Input
          label={t("login.confirmPassword")}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="********"
          icon={<FaLock />}
          error={errorConfirm}
        />

        <Button text={t("login.updatePassword")} type="submit" />
      </form>
    </div>
  );
}
