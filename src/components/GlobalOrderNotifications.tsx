import React from 'react';
import { useOrderNotifications } from '../hooks/useOrderNotifications';

export default function GlobalOrderNotifications() {
  useOrderNotifications();
  return null;
}
