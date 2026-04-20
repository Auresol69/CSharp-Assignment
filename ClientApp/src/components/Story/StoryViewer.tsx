import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Story {
  id: string;
  url: string;
}

interface UserStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
}

interface Props {
  userStories: UserStory[]; // Danh sách các user có story
  initialUserIndex: number; // User đang được chọn để xem
  onClose: () => void;
}

const StoryViewer = ({ userStories, initialUserIndex, onClose }: Props) => {
    const [userIndex, setUserIndex] = useState(initialUserIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false); // Mặc định là đang chạy
    const currentUser = userStories[userIndex];
    const currentStory = currentUser.stories[storyIndex];

    // Hàm chuyển sang story tiếp theo
    const nextStory = useCallback(() => {
        if (storyIndex < currentUser.stories.length - 1) {
        // Còn story của user này -> sang cái tiếp theo
        setStoryIndex(prev => prev + 1);
        setProgress(0);
        } else if (userIndex < userStories.length - 1) {
        // Hết story của user này -> sang user tiếp theo
        setUserIndex(prev => prev + 1);
        setStoryIndex(0);
        setProgress(0);
        } else {
        // Hết sạch sành sanh -> đóng modal
        onClose();
        }
    }, [storyIndex, userIndex, currentUser.stories.length, userStories.length, onClose]);

    // Hàm quay lại story trước
    const prevStory = () => {
        if (storyIndex > 0) {
        setStoryIndex(prev => prev - 1);
        setProgress(0);
        } else if (userIndex > 0) {
        setUserIndex(prev => prev - 1);
        setStoryIndex(userStories[userIndex - 1].stories.length - 1);
        setProgress(0);
        }
    };

    // Logic tự động chạy thanh Progress (5 giây mỗi story)
    useEffect(() => {
        if (isPaused) return; // Nếu đang tạm dừng thì không chạy timer
        const timer = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) return 100;
            return prev + 1; // Tăng dần mỗi 50ms (tổng cộng 5s)
        });
        }, 50);

        if (progress >= 100) {
        nextStory();
        }

        return () => clearInterval(timer);
    }, [progress, nextStory]);

    return (
        <div className="fixed inset-y-0 right-0 max-w-[calc(100%-256px)] bg-gray-500 flex items-center justify-center select-none">
            {/* Nút đóng */}
            <button onClick={onClose} className="absolute top-4 right-4 text-black hover:bg-white/20 p-2 rounded-full z-50">
            <X size={32} />
            </button>

            <button 
                onClick={prevStory} 
                className="absolute left-20 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-all z-[1001]"
                >
                <ChevronLeft size={48} strokeWidth={1.5} />
            </button>

            {/* Vùng hiển thị chính */}
            <div className="relative w-full max-w-[450px] aspect-[9/16] bg-gray-900 overflow-hidden shadow-2xl rounded-2xl cursor-pointer"
                onMouseDown={() => setIsPaused(true)} // Nhấn chuột xuống thì dừng
                onMouseUp={() => setIsPaused(false)}   // Thả chuột ra thì chạy tiếp
                onMouseLeave={() => setIsPaused(false)} // Chuột rời khỏi vùng ảnh cũng chạy tiếp
            >
                    {/* Thanh Progress Bar */}
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                {currentUser.stories.map((_, index) => (
                    <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-50 ease-linear"
                        style={{ 
                            width: index === storyIndex ? `${progress}%` : index < storyIndex ? '100%' : '0%' 
                        }}
                    />
                    </div>
                ))}
                </div>
                {/* Thông tin User */}
                <div className="absolute top-6 left-4 flex items-center gap-3 z-50 pt-4">
                    <img src={currentUser.userAvatar} className="w-10 h-10 rounded-full border-2 border-blue-500" alt="avatar" />
                    <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentUser.userName}</span>
                </div>

                <div className="absolute top-10 right-4 z-[1002]">
                    <button 
                        onClick={(e) => { 
                        e.stopPropagation(); // Chống nổi bọt để không trigger pause/play của khung hình
                        setIsPaused(!isPaused); 
                        }} 
                        className="p-2 text-white/80 hover:text-white transition-colors"
                    >
                        {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    </button>
                </div>
                {/* Nội dung Story */}
                <img src={currentStory.url} className="w-full h-full object-contain overflow-hidden rounded-2xl relative" alt="story-content" />


            </div>
            {/* Mũi tên PHẢI */}
            <button 
                onClick={nextStory} 
                className="absolute right-20 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all z-[1000]"
            >
                <ChevronRight size={60} strokeWidth={1} />
            </button>
        </div>
    );
};

export default StoryViewer;