import { useEffect, useState } from "react";
import FriendCard from "../../components/Friends/FriendCard";
    import {
        getFriends, 
        getRequests, 
        getSuggestions
} from "../../services/api/friendsApi";

type TabType = "friends" | "requests" | "suggestions";

interface Friend {
    userId?: string;
    id?: string;
    name: string;
    avatar: string;
}

const FriendPage = () => {
    const [tab, setTab] = useState<TabType>("friends");

    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<Friend[]>([]);
    const [suggestions, setSuggestions] = useState<Friend[]>([]);

    const [loading, setLoading] = useState(false);

    // load data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [fRes, rRes, sRes] = await Promise.all([
                getFriends(),
                getRequests(),
                getSuggestions()
            ]);

            setFriends(fRes.data);
            setRequests(rRes.data);
            setSuggestions(sRes.data);

        } catch (err) {
            console.error("Load friends error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-4">

            {/* TAB BUTTONS */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setTab("friends")}
                    className={`px-4 py-2 rounded-lg text-sm ${tab === "friends"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        }`}
                >
                    Bạn bè
                </button>

                <button
                    onClick={() => setTab("requests")}
                    className={`px-4 py-2 rounded-lg text-sm ${tab === "requests"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        }`}
                >
                    Lời mời
                </button>

                <button
                    onClick={() => setTab("suggestions")}
                    className={`px-4 py-2 rounded-lg text-sm ${tab === "suggestions"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        }`}
                >
                    Gợi ý
                </button>
            </div>

            {/* CONTENT */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {/* FRIENDS */}
                    {tab === "friends" &&
                        friends.map((f) => (
                            <FriendCard
                                key={f.userId ?? f.id}
                                id={f.userId ?? f.id}
                                name={f.name}
                                avatar={f.avatar}
                                type="friend"
                                onAction={fetchData}
                            />
                        ))
                    }

                    {/* REQUESTS */}
                    {tab === "requests" &&
                        requests.map((f) => (
                            <FriendCard
                                key={f.userId ?? f.id}
                                id={f.userId ?? f.id}
                                name={f.name}
                                avatar={f.avatar}
                                type="request"
                                onAction={fetchData}
                            />
                        ))
                    }

                    {/* SUGGESTIONS */}
                    {tab === "suggestions" &&
                        suggestions.map((f) => (
                            <FriendCard
                                key={f.userId ?? f.id}
                                id={f.userId ?? f.id}
                                name={f.name}
                                avatar={f.avatar}
                                type="suggest"
                                onAction={fetchData}
                            />
                        ))
                    }

                </div>
            )}

        </div>
    );
};

export default FriendPage;
