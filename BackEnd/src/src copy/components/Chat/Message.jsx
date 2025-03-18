import React from 'react';
import { getMessageTimestamp } from '../../utils/dateUtils';

const Message = ({ message, isOwn }) => {
  const messageClass = isOwn
    ? 'bg-blue-600 text-white self-end'
    : 'bg-gray-200 text-gray-800 self-start';

  return (
    <div className={`flex flex-col max-w-[70%] mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-lg px-4 py-2 ${messageClass}`}>
        {message.content}
        {message.imageUrl && (
          <div className="mt-2">
            <img 
              src={message.imageUrl} 
              alt="Message attachment" 
              className="max-h-60 rounded-lg"
              onClick={() => window.open(message.imageUrl, '_blank')}
            />
          </div>
        )}
      </div>
      <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
        {getMessageTimestamp(message.timestamp)}
        {isOwn && (
          <span className="ml-2">
            {message.read ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;