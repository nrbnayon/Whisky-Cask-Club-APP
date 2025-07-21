// utils/helpers.ts

// Generate unique ID for purchases and other entities
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate days between dates
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get investment status color
export const getInvestmentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-500',
      };
    case 'pending':
      return {
        bg: 'bg-yellow-500',
        text: 'text-white',
        border: 'border-yellow-500',
      };
    case 'completed':
      return {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-500',
      };
    case 'reject':
      return {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-500',
      };
    default:
      return {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-500',
      };
  }
};