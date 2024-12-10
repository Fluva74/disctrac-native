import { formatDistanceToNow } from 'date-fns';

export const formatMessageTimestamp = (timestamp: any, createdAt: string): string => {
  try {
    // Try to use Firebase timestamp first
    if (timestamp?.toDate) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    
    // Fallback to createdAt
    if (createdAt) {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    }

    // Final fallback
    return 'Recently';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Recently';
  }
}; 