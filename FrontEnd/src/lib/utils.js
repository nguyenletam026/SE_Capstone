// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      // hour: '2-digit', // Removed time for simpler date display
      // minute: '2-digit' 
    };
    // Using 'en-GB' for dd/mm/yyyy or 'en-US' for mm/dd/yyyy as an example
    return new Date(dateString).toLocaleDateString('en-GB', options); 
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

// Format date and time string
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString('en-US', options);
  } catch (error) {
    console.error("Error formatting date time:", dateString, error);
    return 'Invalid Date';
  }
}; 