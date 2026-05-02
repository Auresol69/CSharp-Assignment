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
                <div className="w-full h-full flex flex-col items-center justify-center px-6">
                    <LoginForm onOpenRegister={() => setIsRegisterOpen(true)} />
                    
                    {/* Footer nhỏ phía dưới Form */}
                    <div className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">
                        © 2026 InteractHub — SGU Student Project
                    </div>
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