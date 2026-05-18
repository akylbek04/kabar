import { useState } from "react";
import { Hash, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { TopicType } from "@/types/chat.type";
import { cn } from "@/lib/utils";
import { formatChatTime, isImageUrl } from "@/lib/helper";

interface Props {
  topics: TopicType[];
  activeTopicId: string | null;
  isCreatingTopic: boolean;
  onSelectTopic: (topicId: string) => void;
  onCreateTopic: (title: string) => void;
}

const TopicSidebar = ({
  topics,
  activeTopicId,
  isCreatingTopic,
  onSelectTopic,
  onCreateTopic,
}: Props) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const handleCreate = () => {
    const title = newTopicTitle.trim();
    if (!title) return;
    onCreateTopic(title);
    setNewTopicTitle("");
    setIsAdding(false);
  };

  const getTopicPreview = (topic: TopicType) => {
    const last = topic.lastMessage;
    if (!last) return "No messages yet";
    if (last.image) {
      return isImageUrl(last.image) ? "Photo" : "Attachment";
    }
    return last.content || "No messages yet";
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Topics</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {topics.map((topic) => (
          <button
            key={topic._id}
            type="button"
            onClick={() => onSelectTopic(topic._id)}
            className={cn(
              "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
              activeTopicId === topic._id
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent"
            )}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <Hash className="size-3.5 shrink-0 opacity-70" />
              <span className="text-sm font-medium truncate">{topic.title}</span>
            </div>
            <TopicMeta
              preview={getTopicPreview(topic)}
              time={topic.lastMessage?.updatedAt || topic.updatedAt}
            />
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        {isAdding ? (
          <div className="space-y-2">
            <Input
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Topic name"
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={isCreatingTopic || !newTopicTitle.trim()}
                onClick={handleCreate}
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-4" />
            New topic
          </Button>
        )}
      </div>
    </aside>
  );
};

function TopicMeta({
  preview,
  time,
}: {
  preview: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pl-5">
      <p className="text-xs text-muted-foreground truncate">{preview}</p>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {formatChatTime(time)}
      </span>
    </div>
  );
}

export default TopicSidebar;
