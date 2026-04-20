import React, { useState } from "react";
import SplitScreenLayout from "../layouts/LoginLayout.tsx";
import LoginCarousel from "../components/Login/LoginCarousel.tsx";
import LoginForm from "../components/Login/LoginForm.tsx";
import RegisterModal from "../components/Login/RegisterModal.tsx";

const LoginPages: React.FC = () => {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    return (
        <>
            <SplitScreenLayout background={<LoginCarousel/>}>
                <LoginForm onOpenRegister={() => setIsRegisterOpen(true)} />
                
                <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    © 2026 InteractHub - SGU Student Project
                </div>
            </SplitScreenLayout>

            <RegisterModal 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)} 
            />
        </>
    );
};

export default LoginPages;