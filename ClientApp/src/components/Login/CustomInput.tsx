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
    
    //State quản lý hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    //State kiểm tra xem có phải đúng kiểu password hay không để hiển thị icon
    const isPasswordType = type === "password";
    //Nếu là kiểu password thì sẽ hiển thị icon, khi click vào icon sẽ đổi trạng thái showPassword
    const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
        <div className="relative w-full mx-auto my-6">
            <div className={`relative rounded-xl transition-all duration-500 bg-gray-900
                ${error 
                    ? "border-red-500" 
                    : isFocused ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "border-gray-500"
                }`}>
                
                <input 
                    type={inputType} 
                    className={`w-full bg-transparent text-white text-xl outline-none relative z-10 px-5 py-8 transition-all
                        ${isPasswordType ? "pr-14" : "pr-5"}`}
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { setIsFocused(false); 
                                    if (onBlur) onBlur(); }}
                    onChange={(e) => onChange(e.target.value)}
                />

                <span className={`absolute left-[3px] px-2 bg-gray-900 transition-all duration-300 pointer-events-none z-20 top-1/2 
                    ${(isFocused || value !== "") 
                        ? "-translate-y-[1.8rem] text-sm text-red-500 border-x border-red-500 scale-100 opacity-100" 
                        : "-translate-y-1/2 text-xl text-gray-400 opacity-80"}`}>
                    {label}
                </span>

                {/* Hiển thị icon nếu là trường mật khẩu */}
                {isPasswordType && (
                    <button 
                    type="button" 
                    // Ép vị trí tuyệt đối ở bên phải
                    className="absolute right-[-8px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    style={{ width: '32px', height: '32px', border: 'none', background: 'none', padding: '0' }}
                    onClick={() => setShowPassword(!showPassword)}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            // Ép kích thước SVG không cho nó nhảy về 0px hoặc rectangle
                            style={{ width: '24px', height: '24px', display: 'block' }}
                            >
                            {showPassword ? (
                                /* Icon Eye-slash (Ẩn mật khẩu) */
                                <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.045.136.045.28 0 .417zM12.469 15.346l-4.03-4.03a3 3 0 004.03 4.03zM1.177 11.761a11.245 11.245 0 002.631 4.31l3.099 3.099a5.25 5.25 0 006.71 6.71l2.477 2.477a11.217 11.217 0 01-4.242.827c-4.97 0-9.185-3.223-10.675-7.69a.749.749 0 010-.417z" />
                            ) : (
                                /* Icon Eye (Hiện mật khẩu) */
                                <>
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.045.136.045.28 0 .417-1.49 4.47-5.705 7.693-10.676 7.693-4.97 0-9.186-3.223-10.675-7.69a.749.749 0 010-.417zm10.678 4.553a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" clipRule="evenodd" />
                                </>
                            )}
                        </svg>
                    </button>
                )}
            </div>
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-[#ef4444] text-xs italic -my-[0px] transition-all duration-300">{error}</p>}
        </div>
    );
}

export default CustomInput;