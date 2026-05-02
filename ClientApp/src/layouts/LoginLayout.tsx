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
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Lớp nền (Carousel) */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>
                <div className="absolute inset-0 opacity-60 dark:opacity-40">
                    {background}
                </div>
            </div>

            {/* Lớp nội dung (Chia tỷ lệ) */}
            <div className="relative z-10 flex w-full h-full bg-transparent">
                {/* Phần bên trái: Để trống để lộ ảnh nền */}
                <div className={`hidden lg:block flex-1`}></div>

                {/* Phần bên phải: Chứa Form nội dung */}
                <div className={`${rightWidth} h-full flex flex-col justify-center items-center bg-transparent p-8`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SplitScreenLayout;