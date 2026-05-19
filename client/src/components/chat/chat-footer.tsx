import { z } from "zod";
import type { MessageType } from "@/types/chat.type";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Mic, Paperclip, Send, Square, Trash2, X } from "lucide-react";
import { Form, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import ChatReplyBar from "./chat-reply-bar";
import { useChat } from "@/hooks/use-chat";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import {
  formatAudioDuration,
  formatMaxFileSize,
  MESSAGE_FILE_MAX_BYTES,
} from "@/lib/helper";

interface Props {
  chatId: string | null;
  topicId?: string | null;
  currentUserId: string | null;
  replyTo: MessageType | null;
  onCancelReply: () => void;
}
const ChatFooter = ({
  chatId,
  topicId,
  currentUserId,
  replyTo,
  onCancelReply,
}: Props) => {
  const messageSchema = z.object({
    message: z.string().optional(),
  });

  const { sendMessage, isSendingMsg } = useChat();
  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const messageValue = form.watch("message");
  const hasText = !!messageValue?.trim();
  const showMicButton = !hasText && !file && !isRecording;

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
      setAudioPreviewUrl(null);
    } else if (selectedFile.type.startsWith("audio/")) {
      setAudioPreviewUrl(URL.createObjectURL(selectedFile));
      setFilePreview(null);
    } else {
      setFilePreview(null);
      setAudioPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setFile(null);
    setFilePreview(null);
    setAudioPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitMessage = (values: { message?: string }, audioFile?: File) => {
    if (isSendingMsg) return;

    const fileToSend = audioFile ?? file;
    if (!values.message?.trim() && !fileToSend) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    sendMessage({
      chatId,
      topicId,
      content: values.message,
      file: fileToSend || undefined,
      replyTo: replyTo,
    });

    onCancelReply();
    handleRemoveFile();
    form.reset();
  };

  const onSubmit = (values: { message?: string }) => {
    submitMessage(values);
  };

  const handleStartRecording = async () => {
    if (isSendingMsg || file) return;
    await startRecording();
  };

  const handleStopAndSend = async () => {
    const audioFile = await stopRecording();
    if (!audioFile) {
      toast.error("Recording too short");
      return;
    }
    submitMessage({ message: "" }, audioFile);
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };

  return (
    <>
      <div
        className="sticky bottom-0
       inset-x-0 z-[999]
       bg-card border-t border-border py-4
      "
      >
        {file && !isSendingMsg && !isRecording && (
          <div className="max-w-6xl mx-auto px-8.5">
            <div className="relative w-fit">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt={file.name}
                  className="object-contain h-16 bg-muted min-w-16"
                />
              ) : audioPreviewUrl ? (
                <div className="flex items-center gap-2 h-16 px-3 bg-muted rounded-md min-w-48">
                  <Mic className="h-4 w-4 shrink-0" />
                  <audio
                    src={audioPreviewUrl}
                    controls
                    className="h-8 max-w-[220px]"
                  />
                </div>
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

        {isRecording && (
          <div className="max-w-6xl mx-auto px-8.5 mb-3">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-sm font-medium">Recording</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatAudioDuration(recordingDuration)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelRecording}
                  title="Cancel recording"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleStopAndSend}
                  title="Send voice message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
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
            {!isRecording && (
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
            )}

            {!isRecording && (
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
            )}

            {isRecording ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="rounded-lg ml-auto"
                onClick={handleStopAndSend}
                title="Stop and send"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : showMicButton ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-lg"
                disabled={isSendingMsg}
                onClick={handleStartRecording}
                title="Record voice message"
              >
                <Mic className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="rounded-lg"
                disabled={isSendingMsg}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </form>
        </Form>
      </div>

      {replyTo && !isSendingMsg && !isRecording && (
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
