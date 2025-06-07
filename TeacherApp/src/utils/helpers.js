// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Stress level utilities
export const getStressLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#64748b';
  }
};

export const getStressLevelIcon = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return 'warning';
    case 'medium':
      return 'alert-circle';
    case 'low':
      return 'checkmark-circle';
    default:
      return 'help-circle';
  }
};

// Number formatting utilities
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatScore = (score) => {
  if (typeof score !== 'number') return 'N/A';
  return score.toFixed(1);
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username) => {
  return username && username.length >= 3;
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
};

export const sortByDate = (array, dateKey, ascending = false) => {
  return array.sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};
