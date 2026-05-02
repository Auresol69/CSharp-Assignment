import React from "react";

interface SplitScreenLayoutProps {
    children: React.ReactNode; 
    background: React.ReactNode; 
    rightWidth?: string; 
}

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({ 
    children, 
    background, 
    rightWidth = "md:w-[35%] lg:w-[30%]" 
}) => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Lớp nền (Carousel) - Luôn chiếm toàn màn hình */}
            <div className="absolute inset-0 z-0">
                {background}
            </div>

            {/* Lớp nội dung */}
            <div className="relative z-10 flex w-full h-full bg-transparent">
                {/* Phần bên trái: Ẩn trên mobile để Form chiếm toàn màn hình */}
                <div className="hidden md:block md:flex-1"></div>

                {/* Phần bên phải: Responsive width */}
                <div className={`w-full ${rightWidth} h-full flex flex-col justify-center bg-transparent backdrop-blur-[2px] md:backdrop-blur-none`}>
                    <div className="w-full px-6 md:px-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitScreenLayout;