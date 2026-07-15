import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection: HubConnection | null = null;

export const createSignalRConnection = async (token: string): Promise<HubConnection> => {
  if (connection) {
    try {
      await connection.stop();
    } catch {
      // Ignore stop errors
    }
  }

  connection = new HubConnectionBuilder()
    .withUrl("http://10.218.174.93:5153/hubs/notification", {
      accessTokenFactory: () => token,
      skipNegotiation: false,
      transport: undefined,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Information)
    .build();

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
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SignalR connection timeout")), 10000)
    );
    await Promise.race([connection.start(), timeoutPromise]);
    console.log("✅ SignalR: Kết nối thành công");
    return connection;
  } catch (err) {
    console.error("❌ SignalR: Lỗi kết nối", err);
    connection = null;
    throw err;
  }
};

export const getSignalRConnection = (): HubConnection | null => connection;

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

// ═══════════════════════════════════════════════════════
// NOTIFICATION Listeners
// ═══════════════════════════════════════════════════════

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

export const onReceiveNotification = (callback: (data: any) => void) => {
  setupSignalRListeners({ onReceiveNotification: callback });
};

export const offAllSignalRListeners = () => {
  if (connection) {
    connection.off("receivenotification");
    connection.off("receivemessage");
    connection.off("userconnected");
    connection.off("userdisconnected");
    connection.off("receivefriendrequest");
    connection.off("friendrequestaccepted");
    connection.off("receivechatmessage");
    connection.off("messagesmarkedasread");
    connection.off("usertyping");
    connection.off("userstoppedtyping");
    console.log("✅ SignalR: All listeners removed");
  }
};

export const offReceiveNotification = () => {
  connection?.off("receivenotification");
};

// ═══════════════════════════════════════════════════════
// CHAT – Types
// ═══════════════════════════════════════════════════════

export interface NewMessageSignalDto {
  idMessage: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  content: string;
  sentAt: string;
}

export interface MessagesReadSignalDto {
  conversationId: string;
  readByUserId: string;
}

// ═══════════════════════════════════════════════════════
// CHAT – Listeners
// ═══════════════════════════════════════════════════════

export const onReceiveChatMessage = (callback: (msg: NewMessageSignalDto) => void) => {
  connection?.on("receivechatmessage", callback);
};

export const offReceiveChatMessage = () => {
  connection?.off("receivechatmessage");
};

export const onMessagesMarkedAsRead = (callback: (dto: MessagesReadSignalDto) => void) => {
  connection?.on("messagesmarkedasread", callback);
};

export const offMessagesMarkedAsRead = () => {
  connection?.off("messagesmarkedasread");
};

export const onUserTyping = (callback: (conversationId: string, userId: string) => void) => {
  connection?.on("usertyping", callback);
};

export const onUserStoppedTyping = (callback: (conversationId: string, userId: string) => void) => {
  connection?.on("userstoppedtyping", callback);
};

export const offTypingListeners = () => {
  connection?.off("usertyping");
  connection?.off("userstoppedtyping");
};

// ═══════════════════════════════════════════════════════
// CHAT – Invokers (client → server)
// ═══════════════════════════════════════════════════════

export const joinConversation = async (conversationId: string) => {
  try {
    await connection?.invoke("JoinConversation", conversationId);
  } catch (err) {
    console.error("SignalR: Lỗi JoinConversation", err);
  }
};

export const leaveConversation = async (conversationId: string) => {
  try {
    await connection?.invoke("LeaveConversation", conversationId);
  } catch (err) {
    console.error("SignalR: Lỗi LeaveConversation", err);
  }
};

export const sendChatMessageViaHub = async (receiverId: string, content: string) => {
  if (!connection) throw new Error("SignalR not connected");
  await connection.invoke("SendChatMessage", { receiverId, content });
};

export const startTypingSignalR = async (conversationId: string) => {
  try {
    await connection?.invoke("StartTyping", conversationId);
  } catch { /* silent */ }
};

export const stopTypingSignalR = async (conversationId: string) => {
  try {
    await connection?.invoke("StopTyping", conversationId);
  } catch { /* silent */ }
};

export const markConversationAsReadSignalR = async (conversationId: string) => {
  try {
    await connection?.invoke("MarkConversationAsRead", conversationId);
  } catch { /* silent */ }
};

export default {
  createSignalRConnection,
  getSignalRConnection,
  disconnectSignalR,
  setupSignalRListeners,
  onReceiveNotification,
  offReceiveNotification,
  offAllSignalRListeners,
  onReceiveChatMessage,
  offReceiveChatMessage,
  onMessagesMarkedAsRead,
  offMessagesMarkedAsRead,
  onUserTyping,
  onUserStoppedTyping,
  offTypingListeners,
  joinConversation,
  leaveConversation,
  sendChatMessageViaHub,
  startTypingSignalR,
  stopTypingSignalR,
  markConversationAsReadSignalR,
};
