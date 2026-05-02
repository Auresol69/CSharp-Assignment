import React, { useState, useEffect } from "react";

const LoginImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop"
];

const LoginCarousel: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((index) => (index + 1) % LoginImages.length);
        }, 5000); // Tăng thời gian chuyển ảnh lên 5s cho đỡ mỏi mắt
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {LoginImages.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    alt="Background"
                />
            ))}
            {/* Lớp phủ dải màu (Gradient Overlay) giúp Form nổi bật hơn */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#020617]/70 to-[#0f172a]/80"></div>
        </div>
    );
};

export default LoginCarousel;