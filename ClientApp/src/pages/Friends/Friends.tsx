import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/Friends/FriendCard';

const Friends = () => {
  const navigate = useNavigate();

  // Header của mỗi Grid
  const GridHeader = ({ title, route }: { title: string, route: string }) => (
    <div className="flex justify-between items-center mb-4 px-2">
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      <button 
        onClick={() => navigate(route)}
        className="text-blue-600 text-sm font-medium hover:underline"
      >
        Xem tất cả
      </button>
    </div>
  );

  return (
    <div className="max-w-[calc(100%-10rem)] ml-36 p-6 space-y-10">
      {/* 1. Lời mời kết bạn */}
      <section>
        <GridHeader title="Lời mời kết bạn" route="/friends/requests" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          <FriendCard name="Nguyễn Văn A" avatar="https://i.pravatar.cc/150?u=1" type="request" />
          <FriendCard name="Trần Thị B" avatar="https://i.pravatar.cc/150?u=2" type="request" />
        </div>
      </section>

      {/* 2. Bạn bè */}
      <section>
        <GridHeader title="Bạn bè" route="/friends/list" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          <FriendCard name="Lê Văn C" avatar="https://i.pravatar.cc/150?u=3" type="friend" />
          {/* ... Thêm vài card mẫu */}
        </div>
      </section>

      {/* 3. Những người bạn có thể biết */}
      <section>
        <GridHeader title="Những người bạn có thể biết" route="/friends/suggest" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          <FriendCard name="Phạm Minh D" avatar="https://i.pravatar.cc/150?u=4" type="suggest" mutualFriends={5} />
          <FriendCard name="Hoàng An E" avatar="https://i.pravatar.cc/150?u=5" type="suggest" mutualFriends={12} />
        </div>
      </section>
    </div>
  );
};

export default Friends