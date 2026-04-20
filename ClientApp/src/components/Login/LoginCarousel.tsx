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
            // Cập nhật chỉ số ảnh tiếp theo, quay lại ảnh đầu nếu đã đến cuối
            setCurrentImageIndex((index) => (index + 1) % LoginImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {LoginImages.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    alt="Background"
                />
            ))}
            <div className="absolute inset-0 bg-black/40"></div>
        </div>
    );
};

export default LoginCarousel;