import React, { useState } from "react";
import ReactDOM from "react-dom";
import CustomInput from "../Login/CustomInput";
import {validateFullName, validateEmail, validatePassword, validateConfirmPassword} from "../../utils/validation";

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const handleBlur = (field: string) => {
        setErrors((prev) => ({
            ...prev,
            [field]: field === "fullName" ? validateFullName(fullName) :
                    field === "email" ? validateEmail(email) :
                    field === "password" ? validatePassword(password) :
                    field === "confirmPassword" ? validateConfirmPassword(password, confirmPassword) : ""
        }));
    };
    // Nếu không mở thì không render gì cả
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            // ÉP CỨNG LAYOUT BẰNG INLINE STYLE ĐỂ CHỐNG LỖI CSS GLOBAL
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 99999,
                padding: '16px'
            }}
        >
            {/* OVERLAY - Lớp nền đen mờ */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}
                onClick={onClose}
            ></div>

            {/* MODAL CONTENT */}
            <div 
                className="relative bg-white border-2 border-black rounded-[40px] p-8 shadow-2xl w-1/3 h-2/3 max-w-md overflow-y-auto"
                style={{ 
                    zIndex: 100000, 
                    backgroundColor: 'white', 
                    maxHeight: '95vh',
                    position: 'relative'
                }}
            >
                {/* Nút đóng X */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-8 text-gray-400 hover:text-black transition-colors text-2xl font-bold"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-gray-800 italic tracking-tighter">
                        Tạo tài khoản iHub
                    </h2>
                    <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Dành cho sinh viên SGU</p>
                </div>
                
                <form className="space-y-[20px] w-1/2 flex flex-col mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <CustomInput 
                        label="Họ và tên" 
                        value={fullName} 
                        error={errors.fullName}
                        onChange={(val) => {
                            setFullName(val);
                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                        }}
                        onBlur={() => handleBlur("fullName")}
                    />

                    <CustomInput 
                        label="Email sinh viên (@sgu.edu.vn)" 
                        value={email} 
                        error={errors.email}
                        onChange={(val) => {
                            setEmail(val);
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onBlur={() => handleBlur("email")}
                    />

                    <CustomInput 
                        label="Mật khẩu" 
                        type="password"
                        value={password} 
                        error={errors.password}
                        onChange={(val) => {
                            setPassword(val);
                            if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        onBlur={() => handleBlur("password")}
                    />

                    <CustomInput 
                        label="Xác nhận mật khẩu" 
                        type="password"
                        value={confirmPassword} 
                        error={errors.confirmPassword}
                        onChange={(val) => {
                            setConfirmPassword(val);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                        }}
                        onBlur={() => handleBlur("confirmPassword")}
                    />
                    
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg mt-6 transition-all      active:scale-95 uppercase"
                    >
                        Đăng ký ngay
                    </button>
                </form>

                <div className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed">
                    © 2026 INTERACTHUB - SGU PROJECT<br/>
                    BẰNG CÁCH ĐĂNG KÝ, BẠN ĐỒNG Ý VỚI ĐIỀU KHOẢN CỦA CHÚNG TÔI
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RegisterModal;