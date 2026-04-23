import { Camera } from 'lucide-react';

interface MediaSectionProps {
  coverImage: string;
  avatar: string;
}

const MediaSection = ({ coverImage, avatar }: MediaSectionProps) => (
  <div className="relative h-40 mb-10">
    <div className="w-full h-32 bg-gray-200 rounded-xl relative overflow-hidden group border border-gray-100">
      <img src={coverImage} className="w-full h-full object-cover" alt="cover" />
      <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Camera /></button>
    </div>
    <div className="absolute -bottom-6 left-6">
      <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden relative shadow-md bg-gray-50">
        <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
        <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Camera size={14}/></button>
      </div>
    </div>
  </div>
);
export default MediaSection;