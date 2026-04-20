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
        <div className="w-[80%] max-w-sm bg-[#ffffff]/95 backdrop-blur-sm p-8 rounded-[40px] mx-auto shadow-lg border border-gray-200">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-blue-600 tracking-tighter mb-2 italic">InteractHub</h1>
                <h2 className="text-xl font-bold text-gray-700">Chào mừng trở lại!</h2>
            </div>

            <form className="space-y-[20px] px-[20px]" onSubmit={handleSubmit}>
                <CustomInput label="Email" value={email} error={emailError} onChange={(v) => { setEmail(v); setEmailError(""); }} />
                <CustomInput label="Password" type="password" value={password} error={passwordError} onChange={(v) => { setPassword(v); setPasswordError(""); }} />

                <div className="flex items-center justify-between text-sm pt-2">
                    <button type="button" className="text-gray-400 hover:text-blue-600">Quên mật khẩu?</button>
                    <button type="button" onClick={onOpenRegister} className="text-blue-600 font-bold hover:underline">Tạo tài khoản</button>
                </div>

                <button type="submit" className="block mx-auto w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mb-[20px]
                                                active:scale-95">
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default LoginForm;