import React, { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import CustomInput from "../Login/CustomInput";
import { validateEmail, validatePassword } from "../../utils/validation";
import api from "../../services/api";

interface LoginFormProps {
    onOpenRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOpenRegister }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);
        setSubmitError("");

        if (eErr || pErr) {
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.post("/auth/login", { email, password });

            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("authUser", JSON.stringify(response.data.user));

            navigate("/Home");
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setSubmitError(axiosError.response?.data?.message ?? "Dang nhap that bai. Vui long thu lai.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[92%] max-w-md bg-[#0f172a]/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl sm:rounded-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700/50">
            <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-4xl sm:text-5xl font-black text-blue-500 tracking-tighter mb-2 sm:mb-3 italic">InteractHub</h1>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-200">Chao mung tro lai!</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <CustomInput label="Email sinh vien" value={email} error={emailError} onChange={(v) => { setEmail(v); setEmailError(""); }} />
                <CustomInput label="Mat khau" type="password" value={password} error={passwordError} onChange={(v) => { setPassword(v); setPasswordError(""); }} />

                <div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-3 sm:gap-0 px-1">
                    <button type="button" className="text-slate-400 hover:text-blue-400 transition-colors">Quen mat khau?</button>
                    <button type="button" onClick={onOpenRegister} className="text-blue-400 font-bold hover:text-blue-300 transition-all">Tao tai khoan moi</button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-blue-900/30 transition-all mt-6 active:scale-[0.98] text-base sm:text-lg"
                >
                    {isSubmitting ? "Dang dang nhap..." : "Dang nhap ngay"}
                </button>
                {submitError && <p className="text-red-400 text-sm text-center font-medium">{submitError}</p>}
            </form>

            <p className="text-center text-slate-500 text-[10px] sm:text-xs mt-8 uppercase tracking-widest font-medium">SGU Student Portal</p>
        </div>
    );
};

export default LoginForm;
