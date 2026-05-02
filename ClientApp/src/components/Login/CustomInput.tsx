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

    // Định nghĩa màu nền cố định để Span che được viền mà không bị lệch màu
    const bgColor = isFocused ? "bg-[#2d3748]" : "bg-[#1a202c]";

    return (
        <div className="relative w-full mx-auto my-4 sm:my-5">
            <div className={`relative flex items-center rounded-xl border-2 transition-all duration-300 min-h-14 sm:min-h-15
                ${error 
                    ? "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)] bg-[#1a202c]" 
                    : isFocused 
                        ? "border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)] bg-[#2d3748]" 
                        : "border-gray-600 hover:border-gray-500 bg-[#1a202c]"
                }`}>
                
                <input 
                    type={inputType} 
                    className="w-full bg-transparent text-white text-base sm:text-lg outline-none z-10 px-4 py-3 pr-12"
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { 
                        setIsFocused(false); 
                        if (onBlur) onBlur(); 
                    }}
                    onChange={(e) => onChange(e.target.value)}
                />

                <span className={`absolute left-4 px-2 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap ${bgColor}
                    ${(isFocused || value !== "") 
                        ? "top-0 -translate-y-1/2 text-[11px] sm:text-sm opacity-100 font-bold " + (error ? "text-red-400" : "text-blue-300")
                        : "inset-y-0 my-auto h-fit text-base sm:text-lg text-gray-400 opacity-70"}`}>
                    {label}
                </span>

                {isPasswordType && (
                    <button 
                        type="button" 
                        className="absolute right-3 p-2 text-gray-400 hover:text-blue-300 transition-colors z-30"
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
            {error && <p className="text-red-400 text-[11px] sm:text-[12px] mt-1.5 ml-1.5 font-semibold">{error}</p>}
        </div>
    );
}

export default CustomInput;