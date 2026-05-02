import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";

interface CustomInputProps {
    id?: string;
    label: string;
    value: string;
    type?: string;
    error?: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChange, type = "text", error, onBlur }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    //State quản lý hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    //State kiểm tra xem có phải đúng kiểu password hay không để hiển thị icon
    const isPasswordType = type === "password";
    //Nếu là kiểu password thì sẽ hiển thị icon, khi click vào icon sẽ đổi trạng thái showPassword
    const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
        <div className="relative w-full mx-auto my-4">
            <div className={`relative flex items-center w-full h-14 bg-slate-50 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-5 border-2 transition-all duration-300
                ${error 
                    ? "border-amber-500 dark:border-amber-400" 
                    : "border-transparent focus-within:border-indigo-500 dark:focus-within:border-indigo-400"
                }`}>
                
                {/* Icon bên trái để cân bằng thị giác */}
                <div className="flex-shrink-0 mr-3">
                    {type === "email" ? (
                        <Mail size={20} className="text-slate-400 dark:text-slate-500" />
                    ) : (
                        <Lock size={20} className="text-slate-400 dark:text-slate-500" />
                    )}
                </div>

                <input 
                    type={inputType} 
                    className="w-full bg-transparent text-left text-slate-700 dark:text-white outline-none font-medium text-base
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           whitespace-nowrap overflow-hidden text-ellipsis"
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { setIsFocused(false); 
                                    if (onBlur) onBlur(); }}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={label}
                />
            </div>
            {error && <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-2 transition-all duration-300">{error}</p>}
        </div>
    );
}

export default CustomInput;