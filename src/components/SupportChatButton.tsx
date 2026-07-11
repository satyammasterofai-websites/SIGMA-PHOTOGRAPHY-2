import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatNotifications } from '../hooks/useChatNotifications';

export default function SupportChatButton() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const constraintsRef = useRef(null);
  const { unreadCount, clearUnread } = useChatNotifications();

  if (role === 'admin') {
    return null;
  }

  const handleClick = () => {
    clearUnread();
    if (user) {
      navigate('/dashboard/chat');
    } else {
      navigate('/login', { state: { redirectTo: '/dashboard/chat' } });
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]" />
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className="fixed bottom-6 left-6 z-[101] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none"
          >
            {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
          </motion.div>
        )}
        <motion.button
          onClick={handleClick}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-brand-purple text-white w-14 h-14 rounded-full shadow-2xl hover:bg-brand-purple/90 transition-colors flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-brand-purple/30"
          aria-label="Live Support Chat"
        >
          <MessageCircle className="w-7 h-7" />
          
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 transform -translate-y-1/4 translate-x-1/4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-rose opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-rose border-2 border-white flex items-center justify-center text-[8px] font-bold">
                {unreadCount}
              </span>
            </span>
          )}
        </motion.button>
        <span className="text-[10px] text-gray-500 font-medium mt-1 drop-shadow-md">Chat now</span>
      </motion.div>
    </>
  );
}
