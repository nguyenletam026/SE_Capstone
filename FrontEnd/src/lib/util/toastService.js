// Toast notification service
class ToastService {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  // Add a listener for toast changes
  addListener(listener) {
    this.listeners.push(listener);
  }

  // Remove a listener
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  // Show a toast notification
  show(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      timestamp: new Date(),
      visible: true
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  // Remove a toast
  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  // Clear all toasts
  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  // Convenience methods
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Create and export singleton instance
const toastService = new ToastService();
export default toastService;
