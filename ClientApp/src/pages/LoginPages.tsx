import React, { useState, useCallback, useMemo } from "react";
import SplitScreenLayout from "../layouts/LoginLayout.tsx";
import LoginCarousel from "../components/Login/LoginCarousel.tsx";
import LoginForm from "../components/Login/LoginForm.tsx";
import RegisterModal from "../components/Login/RegisterModal.tsx";
import { useTheme } from "../hooks/useTheme";

const LoginPages: React.FC = () => {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const { isDark } = useTheme();

    // Tối ưu hiệu năng bằng useCallback
    const handleOpenRegister = useCallback(() => setIsRegisterOpen(true), []);
    const handleCloseRegister = useCallback(() => setIsRegisterOpen(false), []);

    // Tách phần Footer ra để code sạch hơn
    const Footer = useMemo(() => (
        <div className="mt-8 text-center">
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] transition-colors duration-300">
                © 2026 InteractHub • SGU Student Project
            </p>
        </div>
    ), []);

    return (
        <div className="min-h-screen">
            <SplitScreenLayout background={<LoginCarousel />}>
                <div className="flex flex-col h-full justify-center px-4 sm:px-8">
                    {/* LoginForm wrapper để kiểm soát spacing tốt hơn */}
                    <LoginForm onOpenRegister={handleOpenRegister} />
                    {Footer}
                </div>
            </SplitScreenLayout>

            <RegisterModal 
                isOpen={isRegisterOpen} 
                onClose={handleCloseRegister} 
            />
        </div>
    );
};

export default LoginPages;