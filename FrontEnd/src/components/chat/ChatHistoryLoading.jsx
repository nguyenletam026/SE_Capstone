import React from "react";

const ChatHistoryLoading = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistoryLoading;
