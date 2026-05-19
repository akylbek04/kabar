import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/helper";

interface Props {
  name: string;
  src?: string;
  size?: string;
  isOnline?: boolean;
  isGroup?: boolean;
  className?: string;
}

const AvatarWithBadge = ({
  name,
  src,
  isOnline,
  isGroup = false,
  size = "w-8 h-8",
  className,
}: Props) => {
  const avatarUrl = isGroup ? undefined : getMediaUrl(src);

  return (
    <div className="relative shrink-0">
      <Avatar className={size}>
        {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
        <AvatarFallback
          className={cn(
            "bg-primary/10 text-foreground font-semibold",
            className
          )}
        >
          {isGroup ? <Users className="size-4" /> : name?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {isOnline && !isGroup && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 bg-green-500" />
      )}
    </div>
  );
};

export default AvatarWithBadge;
