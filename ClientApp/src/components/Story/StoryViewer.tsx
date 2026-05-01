import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Story { id: string; url: string; }
interface UserStory { userId: string; userName: string; userAvatar: string; stories: Story[]; }

interface Props {
  userStories: UserStory[];
  initialUserIndex: number;
  initialStoryId: string; // Đồng bộ với Home.tsx
  onClose: () => void;
}

const StoryViewer = ({ userStories, initialUserIndex, initialStoryId, onClose }: Props) => {
    const navigate = useNavigate();
    const [userIndex, setUserIndex] = useState(initialUserIndex);
    const [storyIndex, setStoryIndex] = useState(() => {
        const user = userStories[initialUserIndex];
        const index = user?.stories.findIndex(s => s.id === initialStoryId);
        return index !== -1 ? index : 0;
    });

    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const currentUser = userStories[userIndex];
    const currentStory = currentUser.stories[storyIndex];

    // Cập nhật URL mỗi khi story thay đổi
    useEffect(() => {
        if (currentUser && currentStory) {
            navigate(`/Home/stories/${currentUser.userId}/${currentStory.id}`, { replace: true });
        }
    }, [userIndex, storyIndex, navigate, currentUser, currentStory]);

    const nextStory = useCallback(() => {
        if (storyIndex < currentUser.stories.length - 1) {
            setStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (userIndex < userStories.length - 1) {
            setUserIndex(prev => prev + 1);
            setStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [storyIndex, userIndex, currentUser.stories.length, userStories.length, onClose]);

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

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
        }, 50);
        if (progress >= 100) nextStory();
        return () => clearInterval(timer);
    }, [progress, isPaused, nextStory]);

    return (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center select-none">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full z-[1001]">
                <X size={32} />
            </button>

            <button onClick={prevStory} className="absolute left-10 md:left-40 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-all z-[1001]">
                <ChevronLeft size={80} strokeWidth={1.5} />
            </button>

            <div className="relative w-full max-w-[450px] aspect-[9/16] bg-gray-900 overflow-hidden shadow-2xl rounded-2xl cursor-pointer"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
            >
                {/* Progress Bar */}
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                    {currentUser.stories.map((_, index) => (
                        <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-50 ease-linear"
                                style={{ width: index === storyIndex ? `${progress}%` : index < storyIndex ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute top-6 left-4 flex items-center gap-3 z-50 pt-4">
                    <img src={currentUser.userAvatar} className="w-10 h-10 rounded-full border-2 border-blue-500" alt="avatar" />
                    <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentUser.userName}</span>
                </div>

                <img src={currentStory.url} className="w-full h-full object-contain" alt="story-content" />
            </div>

            <button onClick={nextStory} className="absolute right-10 md:right-40 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all z-[1001]">
                <ChevronRight size={80} strokeWidth={1.5} />
            </button>
        </div>
    );
};

export default StoryViewer;
