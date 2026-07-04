import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function SupportChatButton() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  // Don't show the button for admins, as they have the admin panel
  if (role === 'admin') {
    return null;
  }

  const handleClick = () => {
    if (user) {
      navigate('/dashboard/chat');
    } else {
      navigate('/login', { state: { redirectTo: '/dashboard/chat' } });
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-center">
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
        
        {/* Notification sign (badge/dot) */}
        <span className="absolute top-0 right-0 flex h-4 w-4 transform -translate-y-1/4 translate-x-1/4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-rose opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-rose border-2 border-white"></span>
        </span>
      </motion.button>
      <span className="text-[10px] text-gray-500 font-medium mt-1 drop-shadow-md">Live Chat</span>
    </div>
  );
}
