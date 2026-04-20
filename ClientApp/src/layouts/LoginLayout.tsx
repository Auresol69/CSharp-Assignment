import React from "react";

interface SplitScreenLayoutProps {
    children: React.ReactNode; // Phần nội dung chính (Form)
    background: React.ReactNode; // Phần hình nền động (Carousel)
    rightWidth?: string; // Tùy chỉnh độ rộng phần bên phải (mặc định 30%)
}

const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({ 
    children, 
    background, 
    rightWidth = "w-[30%]" 
}) => {
    return (
        <div className="relative w-full h-screen overflow-hidden ">
            {/* Lớp nền (Carousel) */}
                {background}

            {/* Lớp nội dung (Chia tỷ lệ) */}
            <div className="relative z-10 flex w-full h-full bg-transparent">
                {/* Phần bên trái: Để trống để lộ ảnh nền */}
                <div className={`block md:block flex-1`}></div>

                {/* Phần bên phải: Chứa Form nội dung */}
                <div className={`${rightWidth} h-full flex flex-col justify-center bg-transparent`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SplitScreenLayout;