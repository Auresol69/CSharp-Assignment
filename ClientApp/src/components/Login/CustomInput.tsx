import React, { useState } from "react";

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
    const [showPassword, setShowPassword] = useState(false);
    
    const isPasswordType = type === "password";
    const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
        <div className="relative w-full mx-auto my-5">
            <div className={`relative flex items-center rounded-lg border-2 transition-all duration-300 min-h-14.5
                /* Thay đổi nền từ bg-gray-900 sang dải màu xám xanh đậm có chiều sâu */
                ${error 
                    ? "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)] bg-gray-900" 
                    : isFocused 
                        ? "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)] bg-[#1e293b]" 
                        : "border-gray-700 hover:border-gray-600 bg-[#0f172a]"
                }`}>
                
                <input 
                    type={inputType} 
                    className={`w-full text-white text-lg outline-none z-10 px-4 py-3
                        ${isPasswordType ? "pr-12" : "pr-4"}`}
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { 
                        setIsFocused(false); 
                        if (onBlur) onBlur(); 
                    }}
                    onChange={(e) => onChange(e.target.value)}
                />

                {/* Chú ý: Đổi màu nền của span label khớp với màu nền mới để không bị lộ vết cắt */}
                <span className={`absolute left-2 px-2 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap
                    ${(isFocused || value !== "") 
                        ? `top-0 -translate-y-1/2 text-sm opacity-100 font-medium ${isFocused ? "bg-[#1e293b]" : "bg-[#0f172a]"} ` + (error ? "text-red-500" : "text-blue-400")
                        : "inset-y-0 my-auto h-fit text-lg text-gray-500 opacity-60"}`}>
                    {label}
                </span>

                {isPasswordType && (
                    <button 
                        type="button" 
                        className="absolute right-3 p-1 text-gray-500 hover:text-blue-400 transition-colors z-30"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            {showPassword ? (
                                <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.045.136.045.28 0 .417zM12.469 15.346l-4.03-4.03a3 3 0 004.03 4.03zM1.177 11.761a11.245 11.245 0 002.631 4.31l3.099 3.099a5.25 5.25 0 006.71 6.71l2.477 2.477a11.217 11.217 0 01-4.242.827c-4.97 0-9.185-3.223-10.675-7.69a.749.749 0 010-.417z" />
                            ) : (
                                <>
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.045.136.045.28 0 .417-1.49 4.47-5.705 7.693-10.676 7.693-4.97 0-9.186-3.223-10.675-7.69a.749.749 0 010-.417zm10.678 4.553a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" clipRule="evenodd" />
                                </>
                            )}
                        </svg>
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-[12px] mt-1.5 ml-1.5 font-medium">{error}</p>}
        </div>
    );
}

export default CustomInput;