import { getChatKind, getOtherUserAndGroup, isUserOnline } from "@/lib/helper";
import { PROTECTED_ROUTES } from "@/routes/routes";
import type { ChatType } from "@/types/chat.type";
import { ArrowLeft, Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { Button } from "../ui/button";
import { useCall } from "@/hooks/use-call";
import { toast } from "sonner";

interface Props {
  chat: ChatType;
  currentUserId: string | null;
  topicTitle?: string;
}
const ChatHeader = ({ chat, currentUserId, topicTitle }: Props) => {
  const navigate = useNavigate();
  const startCall = useCall((s) => s.startCall);
  const callStatus = useCall((s) => s.status);

  const { name, subheading, avatar, isOnline, isGroup, otherUserId, isAI } =
    getOtherUserAndGroup(chat, currentUserId);
  const displayName = topicTitle ? `${name} · #${topicTitle}` : name;
  const isDm = getChatKind(chat) === "dm";
  const canCall =
    isDm &&
    !!otherUserId &&
    !isAI &&
    isUserOnline(otherUserId) &&
    callStatus === "idle";

  const handleCall = (type: "audio" | "video") => {
    if (!otherUserId) return;
    if (!canCall) {
      toast.error("User is offline or unavailable for calls");
      return;
    }
    void startCall({
      chatId: chat._id,
      callee: {
        _id: otherUserId,
        name,
        avatar,
      },
      type,
    });
  };

  return (
    <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-border bg-card px-2 z-50">
      <div className="h-14 px-2 sm:px-4 flex items-center min-w-0">
        <ArrowLeft
          className="w-5 h-5 shrink-0 lg:hidden text-muted-foreground cursor-pointer mr-2"
          onClick={() => navigate(PROTECTED_ROUTES.CHAT)}
        />
        <AvatarWithBadge
          name={name}
          src={avatar}
          isGroup={isGroup}
          isOnline={isOnline}
        />
        <div className="ml-2 min-w-0">
          <h5 className="font-semibold truncate">{displayName}</h5>
          <p
            className={`text-sm truncate ${
              isOnline ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {subheading}
          </p>
        </div>
      </div>

      {isDm && (
        <div className="flex items-center gap-1 pr-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canCall}
            onClick={() => handleCall("audio")}
            title="Voice call"
          >
            <Phone className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canCall}
            onClick={() => handleCall("video")}
            title="Video call"
          >
            <Video className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
