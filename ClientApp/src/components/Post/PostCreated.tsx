import { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X, Smile, BarChart2, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const CreatePost = ({ onPostCreated }: { onPostCreated: (post: any) => void }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      setError('Backend tao post co media dang phu thuoc Cloudinary, nen hien chi noi text-only.');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('Content', content);

      const response = await api.post('/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      onPostCreated({
        id: response.data.idPost,
        user: {
          id: authUser.id || 'me',
          name: authUser.tenTaiKhoan || 'Ban',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
        },
        content: response.data.content || content,
        image: response.data.mediaUrls?.[0],
        time: 'Vua xong',
        likes: 0,
        comments: 0
      });

      setContent('');
      setSelectedImage(null);
      setIsExpanded(false);
    } catch {
      setError('Khong tao duoc bai viet. Hay dang nhap lai hoac kiem tra backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      if (!content.trim() && !selectedImage) {
        setIsExpanded(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      tabIndex={-1}
      className={`p-3 sm:p-4 rounded-2xl shadow-sm border transition-all duration-300 ease-in-out outline-none
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${isExpanded
          ? (isDark ? 'border-blue-500/50 shadow-lg' : 'border-blue-300 shadow-md')
          : (isDark ? 'border-gray-800' : 'border-gray-200')
        }`}
    >
      <div className="flex gap-3 sm:gap-4">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=me"
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-transform ${isExpanded ? 'scale-105 sm:scale-110' : ''}`}
          alt="avatar"
        />

        <div className="flex-1">
          <textarea
            placeholder="Ban dang nghi gi the?"
            onFocus={() => setIsExpanded(true)}
            className={`w-full bg-transparent border-none focus:ring-0 outline-none resize-none transition-all duration-300
              ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
              ${isExpanded ? 'min-h-25 text-sm sm:text-base' : 'min-h-10 text-xs sm:text-sm flex items-center pt-2'}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {selectedImage && (
            <div className="relative mt-3 group">
              <img src={selectedImage} className="max-h-60 sm:max-h-80 w-full rounded-xl object-cover border border-gray-700" alt="preview" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setError('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-bold text-red-500">{error}</p>}

      <div className={`overflow-hidden transition-all duration-500 ease-in-out
        ${isExpanded || selectedImage ? 'max-h-50 opacity-100 mt-3 sm:mt-4' : 'max-h-0 opacity-0'}`}
      >
        <div className={`pt-3 border-t flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
            >
              <ImageIcon size={18} />
            </button>
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'}`}>
              <Smile size={18} />
            </button>
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}>
              <MapPin size={18} />
            </button>
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-purple-400' : 'hover:bg-purple-50 text-purple-600'}`}>
              <BarChart2 size={18} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!content.trim() || isSubmitting}
            className={`w-full sm:w-auto px-6 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${(!content.trim() || isSubmitting)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
          >
            <span>{isSubmitting ? 'Dang dang...' : 'Dang'}</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
