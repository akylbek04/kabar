import { useMessageNotifications } from "@/hooks/use-message-notifications";

const MessageNotificationsListener = () => {
  useMessageNotifications();
  return null;
};

export default MessageNotificationsListener;
