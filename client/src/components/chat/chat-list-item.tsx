import { getChatKind, getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat.type";
import { useLocation } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { formatChatTime, isImageUrl } from "../../lib/helper";
import { useNotifications } from "@/hooks/use-notifications";

interface PropsType {
  chat: ChatType;
  currentUserId: string | null;
  onClick?: () => void;
}
const ChatListItem = ({ chat, currentUserId, onClick }: PropsType) => {
  const { pathname } = useLocation();
  const unreadCount = useNotifications((s) => s.unreadByChat[chat._id] ?? 0);
  const isActive = pathname.includes(chat._id);
  const { lastMessage, createdAt } = chat;

  const { name, avatar, isOnline, isGroup, status } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  const chatKind = getChatKind(chat);
  const hasUnread = unreadCount > 0 && !isActive;

  const getLastMessageText = () => {
    if (!lastMessage) {
      if (isGroup) {
        return chat.createdBy === currentUserId
          ? chatKind === "supergroup"
            ? "Super group created"
            : "Group created"
          : "You were added";
      }
      return status || "Send a message";
    }
    if (lastMessage.image) {
      return isImageUrl(lastMessage.image) ? "📷 Photo" : "📎 Attachment";
    }

    if (isGroup && lastMessage.sender) {
      return `${lastMessage.sender._id === currentUserId
          ? "You"
          : lastMessage.sender.name
        }: ${lastMessage.content}`;
    }

    return lastMessage.content;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        `w-full flex items-center gap-2 p-2 rounded-sm
         hover:bg-sidebar-accent transition-colors text-left`,
        isActive && "!bg-sidebar-accent"
      )}
    >
      <div className="relative shrink-0">
        <AvatarWithBadge
          name={name}
          src={avatar}
          isGroup={isGroup}
          isOnline={isOnline}
        />
        {hasUnread && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
            flex items-center justify-center rounded-full bg-primary
            text-[10px] font-bold text-primary-foreground"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <MotionlessTitleRow
          name={name}
          hasUnread={hasUnread}
          time={formatChatTime(lastMessage?.updatedAt || createdAt)}
        />
        <p
          className={cn(
            "text-xs truncate -mt-px",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          {getLastMessageText()}
        </p>
      </div>
    </button>
  );
};

function MotionlessTitleRow({
  name,
  hasUnread,
  time,
}: {
  name: string;
  hasUnread: boolean;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between mb-0.5 gap-2">
      <h5
        className={cn(
          "text-sm truncate",
          hasUnread ? "font-bold text-foreground" : "font-semibold"
        )}
      >
        {name}
      </h5>
      <span
        className={cn(
          "text-xs ml-2 shrink-0",
          hasUnread ? "text-primary font-medium" : "text-muted-foreground"
        )}
      >
        {time}
      </span>
    </div>
  );
}

export default ChatListItem;
