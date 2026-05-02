import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AxiosError } from "axios";
import CustomInput from "../Login/CustomInput";
import { validateFullName, validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validation";
import { X } from "lucide-react";
import api from "../../services/api";

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
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBlur = (field: string) => {
        setErrors((prev) => ({
            ...prev,
            [field]: field === "fullName" ? validateFullName(fullName) :
                    field === "email" ? validateEmail(email) :
                    field === "password" ? validatePassword(password) :
                    field === "confirmPassword" ? validateConfirmPassword(password, confirmPassword) : ""
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const nextErrors = {
            fullName: validateFullName(fullName),
            email: validateEmail(email),
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(password, confirmPassword)
        };

        setErrors(nextErrors);
        setSubmitError("");

        if (Object.values(nextErrors).some(Boolean)) {
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.post("/auth/register", {
                tenTaiKhoan: fullName,
                email,
                password,
                confirmPassword
            });

            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("authUser", JSON.stringify(response.data.user));
            window.location.href = "/Home";
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setSubmitError(axiosError.response?.data?.message ?? "Dang ky that bai. Vui long thu lai.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-99999 sm:p-4">
            <div
                className="absolute inset-0 bg-[#020617]/95 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            <div
                className="relative bg-[#0f172a] border border-slate-800 rounded-t-4xl sm:rounded-4xl p-6 sm:p-8 shadow-2xl w-full max-w-lg h-[92vh] sm:h-auto overflow-y-auto transition-all animate-in slide-in-from-bottom duration-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-0">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Gia nhap <span className="text-blue-500">InteractHub</span>
                    </h2>
                    <p className="text-slate-400 text-[13px] sm:text-sm mt-2 font-bold">Cong dong sinh vien SGU ket noi va chia se</p>
                </div>

                <form className="space-y-1.5 sm:space-y-2 w-full" onSubmit={handleSubmit}>
                    <CustomInput
                        label="Ho va ten"
                        value={fullName}
                        error={errors.fullName}
                        onChange={(val) => {
                            setFullName(val);
                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                        }}
                        onBlur={() => handleBlur("fullName")}
                    />

                    <CustomInput
                        label="Email sinh vien SGU"
                        value={email}
                        error={errors.email}
                        onChange={(val) => {
                            setEmail(val);
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onBlur={() => handleBlur("email")}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
                        <CustomInput
                            label="Mat khau"
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
                            label="Nhap lai mat khau"
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
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/40 mt-6 transition-all active:scale-[0.98] text-base sm:text-lg"
                    >
                        {isSubmitting ? "Dang dang ky..." : "Dang ky ngay"}
                    </button>
                    {submitError && <p className="text-red-400 text-sm text-center font-medium mt-3">{submitError}</p>}
                </form>

                <div className="mt-8 text-center text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                    2026 INTERACTHUB - DO AN SGU<br/>
                    Viec nhan dang ky dong nghia ban chap nhan moi dieu khoan.
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RegisterModal;
