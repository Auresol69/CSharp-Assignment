import { useRef, useState, useEffect } from 'react';
import { Camera, Image, Send, X, Clapperboard } from 'lucide-react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    // Nền trắng, viền xám nhẹ nhàng
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-6 w-full mx-auto flex flex-row items-center space-x-3">
      
      <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <input type="file" ref={videoInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />

      {/* User's Avatar */}
      <img 
        src="https://via.placeholder.com/40" 
        alt="Avatar" 
        className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-sm"
      />
      
      {/* Ô nhập liệu */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="User ơi, bạn đang nghĩ gì thế?"
          className="w-full bg-gray-100 border-none rounded-full py-2.5 px-5 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-100 focus:bg-gray-50 outline-none transition-all"
        />

        {(content || selectedFile) && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full transition shadow-md"
          >
            <Send size={14} />
          </button>
        )}
      </div>
      
      {/* Cụm Icons bên trái */}
      <div className="flex flex-row items-center">
        {/* Nút bấm chụp ảnh bằng camera để đăng bài */}
        <button 
          onClick={() => videoInputRef.current?.click()} 
          className="hover:bg-gray-100 p-2 rounded-full transition-colors group"
        >
          <Camera size={22} className="text-[#f03243]" />
        </button>
        
        {/* Nút bấm chọn ảnh từ thư viện để đăng bài */}
        <button 
          onClick={() => imageInputRef.current?.click()} 
          className="hover:bg-gray-100 p-2 rounded-full transition-colors group"
        >
          <Image size={22} className="text-[#2acb4a]" />
        </button>
        
        {/* Nút bấm chọn video từ thư viện để đăng bài */}
        <button 
          className="hover:bg-gray-100 p-2 rounded-full transition-colors group"
        >
          <Clapperboard size={22} className="text-[#ea3163]" />
        </button>
      </div>

      {/* Preview vùng chọn file - not done yet */}
      {previewUrl && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/90 p-2 rounded-xl z-20 flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    {selectedFile?.type.startsWith('image/') ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center italic text-[10px] text-white">Video</div>
                    )}
                </div>
                <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">{selectedFile?.name}</span>
            </div>
            <button onClick={removeFile} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={18} />
            </button>
        </div>
      )}
    </div>
  );
};

export default CreatePost;