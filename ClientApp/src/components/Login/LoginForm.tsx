import React, { useState } from "react";
import CustomInput from "../Login/CustomInput";
import { validateEmail, validatePassword } from "../../utils/validation";

interface LoginFormProps {
    onOpenRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOpenRegister }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);

        if (!eErr && !pErr) {
            console.log("Đăng nhập:", { email, password });
            // Gọi service API ở đây
        }
    };

    return (
        <div className="w-[90%] max-w-md bg-white/90 dark:bg-blue-950/80 backdrop-blur-xl p-8 rounded-3xl mx-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/30 dark:border-blue-800/50 transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight mb-4">InteractHub</h1>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Chào mừng trở lại!</h2>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed">Đăng nhập để tiếp tục trải nghiệm</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <CustomInput label="Email" value={email} error={emailError} onChange={(v) => { setEmail(v); setEmailError(""); }} />
                <CustomInput label="Password" type="password" value={password} error={passwordError} onChange={(v) => { setPassword(v); setPasswordError(""); }} />

                <div className="flex items-center justify-between text-base font-medium">
                    <button type="button" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Quên mật khẩu?</button>
                    <button type="button" onClick={onOpenRegister} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all duration-200">Tạo tài khoản</button>
                </div>

                <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold text-lg rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 dark:hover:bg-indigo-700 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] active:scale-[0.97] transition-all duration-200">
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default LoginForm;