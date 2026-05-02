import { useState, useRef } from 'react';
import { Image, Send, X, Smile, BarChart2, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const CreatePost = ({ onPostCreated }: { onPostCreated: (post: any) => void }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Dùng để kiểm tra click ra ngoài

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) return;

    const newPost = {
      id: Date.now().toString(),
      user: { name: "Bạn", avatar: "https://i.pravatar.cc/150?u=me" },
      content,
      image: selectedImage,
      time: "Vừa xong",
      likes: 0,
      comments: 0
    };

    onPostCreated(newPost);
    setContent('');
    setSelectedImage(null);
    setIsExpanded(false);
  };

  // Logic thu gọn khi click ra ngoài
  const handleBlur = (e: React.FocusEvent) => {
    // Nếu click vào một phần tử vẫn nằm trong containerRef thì không thu gọn
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      // Chỉ thu gọn nếu không có nội dung và không có ảnh
      if (!content.trim() && !selectedImage) {
        setIsExpanded(false);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onBlur={handleBlur}
      tabIndex={-1} // Cho phép div nhận sự kiện liên quan đến focus
      className={`p-4 rounded-2xl shadow-sm border transition-all duration-300 ease-in-out outline-none
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${isExpanded 
          ? (isDark ? 'border-blue-500/50 shadow-lg' : 'border-blue-300 shadow-md') 
          : (isDark ? 'border-gray-800' : 'border-gray-200')
        }`}
    >
      <div className="flex gap-4">
        <img 
          src="https://i.pravatar.cc/150?u=me" 
          className={`w-10 h-10 rounded-full transition-transform ${isExpanded ? 'scale-110' : ''}`} 
          alt="avatar" 
        />
        
        <div className="flex-1">
          <textarea
            placeholder="Bạn đang nghĩ gì thế?"
            onFocus={() => setIsExpanded(true)}
            className={`w-full bg-transparent border-none focus:ring-0 outline-none resize-none transition-all duration-300
              ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
              ${isExpanded ? 'min-h-25 text-base' : 'min-h-10 text-sm flex items-center pt-2'}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {selectedImage && (
            <div className="relative mt-3 group">
              <img src={selectedImage} className="max-h-80 w-full rounded-xl object-cover border border-gray-700" alt="preview" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out
        ${isExpanded || selectedImage ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
      >
        <div className={`pt-3 border-t flex justify-between items-center ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
            >
              <Image size={20} />
            </button>
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
            
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'}`}>
              <Smile size={20} />
            </button>
            
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}>
              <MapPin size={20} />
            </button>

            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-purple-400' : 'hover:bg-purple-50 text-purple-600'}`}>
              <BarChart2 size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()} // Ngăn chặn mất focus trước khi kịp click Đăng
              disabled={!content.trim() && !selectedImage}
              className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all
                ${(!content.trim() && !selectedImage) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
            >
              <span>Đăng</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;