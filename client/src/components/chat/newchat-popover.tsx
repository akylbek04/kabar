import { memo, useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  LayoutGrid,
  PenBoxIcon,
  Search,
  UsersIcon,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import type { UserType } from "../../types/auth.type";
import AvatarWithBadge from "../avatar-with-badge";
import { Checkbox } from "../ui/checkbox";
import { useNavigate } from "react-router-dom";

type CreateMode = "chat" | "group" | "supergroup";

export const NewChatPopover = memo(() => {
  const navigate = useNavigate();
  const { fetchAllUsers, users, isUsersLoading, createChat, isCreatingChat } =
    useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("chat");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const resetState = () => {
    setCreateMode("chat");
    setGroupName("");
    setSelectedUsers([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetState();
  };

  const handleBack = () => {
    setCreateMode("chat");
    setGroupName("");
    setSelectedUsers([]);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    const response = await createChat({
      isGroup: createMode === "group",
      isSuperGroup: createMode === "supergroup",
      participants: selectedUsers,
      groupName,
    });
    if (response) {
      setIsOpen(false);
      resetState();
      navigate(`/chat/${response._id}`);
    }
  };

  const handleCreateChat = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const response = await createChat({
        isGroup: false,
        participantId: userId,
      });
      if (response) {
        setIsOpen(false);
        resetState();
        navigate(`/chat/${response._id}`);
      }
    } finally {
      setLoadingUserId(null);
    }
  };

  const isPickerMode = createMode === "group" || createMode === "supergroup";
  const title =
    createMode === "supergroup"
      ? "New Super Group"
      : createMode === "group"
        ? "New Group"
        : "New Chat";

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <PenBoxIcon className="!h-5 !w-5 !stroke-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 z-[999] p-0 rounded-xl min-h-[400px] max-h-[80vh] flex flex-col"
      >
        <PopoverHeader
          isPickerMode={isPickerMode}
          title={title}
          groupName={groupName}
          onGroupNameChange={setGroupName}
          onBack={handleBack}
        />

        <div className="flex-1 justify-center overflow-y-auto px-1 py-1 space-y-1">
          {isUsersLoading ? (
            <Spinner className="w-6 h-6" />
          ) : users?.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No users found
            </div>
          ) : !isPickerMode ? (
            <>
              <CreateOptionItem
                icon={<UsersIcon className="size-4 text-primary" />}
                label="New Group"
                disabled={isCreatingChat}
                onClick={() => setCreateMode("group")}
              />
              <CreateOptionItem
                icon={<LayoutGrid className="size-4 text-primary" />}
                label="New Super Group"
                description="Groups with topics, like Telegram"
                disabled={isCreatingChat}
                onClick={() => setCreateMode("supergroup")}
              />
              {users?.map((user) => (
                <ChatUserItem
                  key={user._id}
                  user={user}
                  isLoading={loadingUserId === user._id}
                  disabled={loadingUserId !== null}
                  onClick={handleCreateChat}
                />
              ))}
            </>
          ) : (
            users?.map((user) => (
              <GroupUserItem
                key={user._id}
                user={user}
                isSelected={selectedUsers.includes(user._id)}
                onToggle={toggleUserSelection}
              />
            ))
          )}
        </div>

        {isPickerMode && (
          <div className="border-t p-3">
            <Button
              onClick={handleCreateGroup}
              className="w-full"
              disabled={
                isCreatingChat ||
                !groupName.trim() ||
                selectedUsers.length === 0
              }
            >
              {isCreatingChat && <Spinner className="w-4 h-4" />}
              {createMode === "supergroup"
                ? "Create Super Group"
                : "Create Group"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
NewChatPopover.displayName = "NewChatPopover";

function PopoverHeader({
  isPickerMode,
  title,
  groupName,
  onGroupNameChange,
  onBack,
}: {
  isPickerMode: boolean;
  title: string;
  groupName: string;
  onGroupNameChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="border-b p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isPickerMode && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <InputGroup>
        <InputGroupInput
          value={isPickerMode ? groupName : ""}
          onChange={
            isPickerMode ? (e) => onGroupNameChange(e.target.value) : undefined
          }
          placeholder={isPickerMode ? "Enter group name" : "Search name"}
          readOnly={!isPickerMode}
        />
        <InputGroupAddon>
          {isPickerMode ? <UsersIcon /> : <Search />}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

const UserAvatar = memo(({ user }: { user: UserType }) => (
  <>
    <AvatarWithBadge name={user.name} src={user.avatar ?? ""} />
    <div className="flex-1 min-w-0">
      <h5 className="text-[13.5px] font-medium truncate">{user.name}</h5>
      <p className="text-xs text-muted-foreground">Hey there! I'm using Kabar</p>
    </div>
  </>
));
UserAvatar.displayName = "UserAvatar";

const CreateOptionItem = memo(
  ({
    icon,
    label,
    description,
    disabled,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left disabled:opacity-50"
    >
      <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  )
);
CreateOptionItem.displayName = "CreateOptionItem";

const ChatUserItem = memo(
  ({
    user,
    isLoading,
    disabled,
    onClick,
  }: {
    user: UserType;
    disabled: boolean;
    isLoading: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      className="relative w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left disabled:opacity-50"
      disabled={isLoading || disabled}
      onClick={() => onClick(user._id)}
    >
      <UserAvatar user={user} />
      {isLoading && <Spinner className="absolute right-2 w-4 h-4 ml-auto" />}
    </button>
  )
);
ChatUserItem.displayName = "ChatUserItem";

const GroupUserItem = memo(
  ({
    user,
    isSelected,
    onToggle,
  }: {
    user: UserType;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <label
      role="button"
      className="w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left"
    >
      <UserAvatar user={user} />
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(user._id)}
      />
    </label>
  )
);
GroupUserItem.displayName = "GroupUserItem";
