import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import ChatHeader from "@/components/chat/chat-header";
import TopicSidebar from "@/components/chat/topic-sidebar";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import { getChatKind } from "@/lib/helper";
import type { MessageType } from "@/types/chat.type";
import { useEffect, useState } from "react";

const SingleChat = () => {
  const chatId = useChatId();
  const {
    fetchSingleChat,
    createTopic,
    isSingleChatLoading,
    isCreatingTopic,
    singleChat,
  } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];
  const topics = singleChat?.topics || [];
  const activeTopicId = singleChat?.activeTopicId || null;
  const isSuperGroup = chat ? getChatKind(chat) === "supergroup" : false;
  const activeTopic = topics.find((t) => t._id === activeTopicId);

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("chat:join", chatId);
    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  const handleSelectTopic = (topicId: string) => {
    if (!chatId || topicId === activeTopicId) return;
    fetchSingleChat(chatId, topicId);
  };

  const handleCreateTopic = async (title: string) => {
    if (!chatId) return;
    const topic = await createTopic(chatId, title);
    if (topic) {
      fetchSingleChat(chatId, topic._id);
    }
  };

  if (isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-svh flex">
      {isSuperGroup && (
        <TopicSidebar
          topics={topics}
          activeTopicId={activeTopicId}
          isCreatingTopic={isCreatingTopic}
          onSelectTopic={handleSelectTopic}
          onCreateTopic={handleCreateTopic}
        />
      )}

      <div className="relative flex flex-col flex-1 min-w-0">
        <ChatHeader
          chat={chat}
          currentUserId={currentUserId}
          topicTitle={activeTopic?.title}
        />

        <div className="flex-1 overflow-y-auto bg-background">
          {messages.length === 0 ? (
            <EmptyState
              title={
                isSuperGroup && activeTopic
                  ? `Start #${activeTopic.title}`
                  : "Start a conversation"
              }
              description="No messages yet. Send the first message"
            />
          ) : (
            <ChatBody chatId={chatId} messages={messages} onReply={setReplyTo} />
          )}
        </div>

        <ChatFooter
          replyTo={replyTo}
          chatId={chatId}
          topicId={isSuperGroup ? activeTopicId : null}
          currentUserId={currentUserId}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  );
};

export default SingleChat;
