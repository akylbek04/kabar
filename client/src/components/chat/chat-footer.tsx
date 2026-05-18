import { z } from "zod";
import type { MessageType } from "@/types/chat.type";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Paperclip, Send, X } from "lucide-react";
import { Form, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import ChatReplyBar from "./chat-reply-bar";
import { useChat } from "@/hooks/use-chat";
import {
  formatMaxFileSize,
  MESSAGE_FILE_MAX_BYTES,
} from "@/lib/helper";

interface Props {
  chatId: string | null;
  currentUserId: string | null;
  replyTo: MessageType | null;
  onCancelReply: () => void;
}
const ChatFooter = ({
  chatId,
  currentUserId,
  replyTo,
  onCancelReply,
}: Props) => {
  const messageSchema = z.object({
    message: z.string().optional(),
  });

  const { sendMessage, isSendingMsg } = useChat();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MESSAGE_FILE_MAX_BYTES) {
      toast.error(`File must be under ${formatMaxFileSize(MESSAGE_FILE_MAX_BYTES)}`);
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values: { message?: string }) => {
    if (isSendingMsg) return;
    if (!values.message?.trim() && !file) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    sendMessage({
      chatId,
      content: values.message,
      file: file || undefined,
      replyTo: replyTo,
    });

    onCancelReply();
    handleRemoveFile();
    form.reset();
  };

  return (
    <>
      <div
        className="sticky bottom-0
       inset-x-0 z-[999]
       bg-card border-t border-border py-4
      "
      >
        {file && !isSendingMsg && (
          <div className="max-w-6xl mx-auto px-8.5">
            <div className="relative w-fit">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt={file.name}
                  className="object-contain h-16 bg-muted min-w-16"
                />
              ) : (
                <div className="flex items-center gap-2 h-16 px-3 bg-muted rounded-md min-w-32">
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-px right-1
                 bg-black/50 text-white rounded-full
                 cursor-pointer
                "
                onClick={handleRemoveFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-6xl px-8.5 mx-auto
            flex items-end gap-2
            "
          >
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isSendingMsg}
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                disabled={isSendingMsg}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              disabled={isSendingMsg}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Input
                    {...field}
                    autoComplete="off"
                    placeholder="Type new message"
                    className="min-h-[40px] bg-background"
                  />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="icon"
              className="rounded-lg"
              disabled={isSendingMsg}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Form>
      </div>

      {replyTo && !isSendingMsg && (
        <ChatReplyBar
          replyTo={replyTo}
          currentUserId={currentUserId}
          onCancel={onCancelReply}
        />
      )}
    </>
  );
};

export default ChatFooter;
