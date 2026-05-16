import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection: HubConnection | null = null;

export const createSignalRConnection = async (token: string): Promise<HubConnection> => {
  if (connection) {
    // Ngắt kết nối cũ nếu đã tồn tại
    try {
      await connection.stop();
    } catch {
      // Ignore stop errors
    }
  }

  connection = new HubConnectionBuilder()
    .withUrl("http://192.168.1.7:5153/hubs/notification", {
      accessTokenFactory: () => token,
      skipNegotiation: false,
      transport: undefined,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Information)
    .build();

  // Event listeners
  connection.onreconnecting(() => {
    console.log("🔄 SignalR: Đang kết nối lại...");
  });

  connection.onreconnected(() => {
    console.log("✅ SignalR: Đã kết nối lại");
  });

  connection.onclose(() => {
    console.log("❌ SignalR: Kết nối đã đóng");
  });

  try {
    // Add 10 second timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SignalR connection timeout")), 10000)
    );
    
    await Promise.race([connection.start(), timeoutPromise]);
    console.log("✅ SignalR: Kết nối thành công");

    return connection;
  } catch (err) {
    console.error("❌ SignalR: Lỗi kết nối", err);
    connection = null; // Reset connection on failure
    throw err;
  }
};

export const getSignalRConnection = (): HubConnection | null => {
  return connection;
};

export const disconnectSignalR = async (): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
      console.log("✅ SignalR: Đã ngắt kết nối");
    } catch (err) {
      console.error("❌ SignalR: Lỗi khi ngắt kết nối", err);
    }
    connection = null;
  }
};

// Đăng ký tất cả listeners cho notifications
export const setupSignalRListeners = (callbacks: {
  onReceiveNotification?: (data: any) => void;
  onReceiveMessage?: (senderId: string, message: string) => void;
  onUserConnected?: (userId: string) => void;
  onUserDisconnected?: (userId: string) => void;
  onReceiveFriendRequest?: (senderId: string, senderName: string, senderAvatarUrl: string) => void;
  onFriendRequestAccepted?: (accepterId: string, accepterName: string, accepterAvatarUrl: string) => void;
} = {}) => {
  if (!connection) {
    console.warn("⚠️ SignalR: Connection not established yet");
    return;
  }

  // SignalR chuyển method name thành camelCase (PascalCase → camelCase)
  // ReceiveNotification → receivenotification
  // UserConnected → userconnected, etc.

  if (callbacks.onReceiveNotification) {
    connection.on("receivenotification", callbacks.onReceiveNotification);
    console.log("✅ SignalR custom callback: receivenotification");
  }

  if (callbacks.onReceiveMessage) {
    connection.on("receivemessage", callbacks.onReceiveMessage);
    console.log("✅ SignalR custom callback: receivemessage");
  }

  if (callbacks.onUserConnected) {
    connection.on("userconnected", callbacks.onUserConnected);
    console.log("✅ SignalR custom callback: userconnected");
  }

  if (callbacks.onUserDisconnected) {
    connection.on("userdisconnected", callbacks.onUserDisconnected);
    console.log("✅ SignalR custom callback: userdisconnected");
  }

  if (callbacks.onReceiveFriendRequest) {
    connection.on("receivefriendrequest", callbacks.onReceiveFriendRequest);
    console.log("✅ SignalR custom callback: receivefriendrequest");
  }

  if (callbacks.onFriendRequestAccepted) {
    connection.on("friendrequestaccepted", callbacks.onFriendRequestAccepted);
    console.log("✅ SignalR custom callback: friendrequestaccepted");
  }
};

// Đăng ký listener cho notifications (backward compatibility)
export const onReceiveNotification = (callback: (data: any) => void) => {
  setupSignalRListeners({ onReceiveNotification: callback });
};

// Hủy tất cả listeners
export const offAllSignalRListeners = () => {
  if (connection) {
    connection.off("receivenotification");
    connection.off("receivemessage");
    connection.off("userconnected");
    connection.off("userdisconnected");
    connection.off("receivefriendrequest");
    connection.off("friendrequestaccepted");
    console.log("✅ SignalR: All listeners removed");
  }
};

// Hủy listener (backward compatibility)
export const offReceiveNotification = () => {
  if (connection) {
    connection.off("receivenotification");
  }
};

export default {
  createSignalRConnection,
  getSignalRConnection,
  disconnectSignalR,
  setupSignalRListeners,
  onReceiveNotification,
  offReceiveNotification,
  offAllSignalRListeners,
};
