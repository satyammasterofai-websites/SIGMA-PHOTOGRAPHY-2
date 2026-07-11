import { useChatNotifications } from '../hooks/useChatNotifications';

export default function GlobalChatListener() {
  useChatNotifications(); // Calls the hook to listen for and show toast notifications
  return null;
}
