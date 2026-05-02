import React, { useState } from "react";
import ReactDOM from "react-dom";
import CustomInput from "../Login/CustomInput";
import { validateFullName, validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validation";
import { X } from "lucide-react"; // Dùng icon cho xịn

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

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-99999 p-4">
            {/* OVERLAY: Làm mờ hậu cảnh và tối đi */}
            <div 
                className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md transition-opacity" 
                onClick={onClose}
            ></div>

            {/* MODAL CONTENT: Tone màu Slate/Navy khớp với Input */}
            <div 
                className="relative bg-[#0f172a] border border-slate-700 rounded-4xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-y-auto transition-all scale-100"
                style={{ maxHeight: '90vh' }}
            >
                {/* Nút đóng X: Chuyển sang icon cho thanh thoát */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Gia nhập <span className="text-blue-500">InteractHub</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Cộng đồng sinh viên SGU kết nối & sẻ chia</p>
                </div>
                
                {/* Form Section: Chỉnh lại width cho hợp lý thay vì w-1/2 */}
                <form className="space-y-2 w-full px-2" onSubmit={(e) => e.preventDefault()}>
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
                        label="Email sinh viên SGU" 
                        value={email} 
                        error={errors.email}
                        onChange={(val) => {
                            setEmail(val);
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onBlur={() => handleBlur("email")}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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
                            label="Nhập lại mật khẩu" 
                            type="password"
                            value={confirmPassword} 
                            error={errors.confirmPassword}
                            onChange={(val) => {
                                setConfirmPassword(val);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                            }}
                            onBlur={() => handleBlur("confirmPassword")}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 mt-6 transition-all active:scale-[0.98] text-lg"
                    >
                        Đăng ký tài khoản
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-8 text-center text-[11px] text-slate-500 leading-relaxed font-medium">
                    © 2026 INTERACTHUB - ĐỒ ÁN SGU<br/>
                    Việc nhấn đăng ký đồng nghĩa bạn chấp nhận mọi điều khoản sử dụng.
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RegisterModal;