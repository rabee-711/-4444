import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons';

interface LoadingIndicatorProps {
  message: string;
}

const reassuringMessages = [
  "...يقوم الذكاء الاصطناعي لدينا بإعداد محتوى مذهل لك",
  ".قد يستغرق هذا بعض الوقت، خاصة بالنسبة لمقاطع الفيديو",
  "!انتظر قليلاً! أشياء رائعة في طريقها إليك",
  ".الخوارزميات تعمل بجد",
  "!الصبر فضيلة، خاصة مع عرض الفيديو",
  ".لحظات قليلة، نحن نضيف لمسة إضافية من التألق"
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  const [extraMessage, setExtraMessage] = useState('');

  useEffect(() => {
    let intervalId: number | undefined;
    if (message.toLowerCase().includes('video') || message.includes('فيديو')) {
      // Start cycling messages only if video is being generated
      setExtraMessage(reassuringMessages[0]);
      intervalId = window.setInterval(() => {
        setExtraMessage(prev => {
          const currentIndex = reassuringMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % reassuringMessages.length;
          return reassuringMessages[nextIndex];
        });
      }, 5000); // Change message every 5 seconds
    } else {
        setExtraMessage('');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [message]);
  
  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8 p-6 bg-gray-800/50 rounded-lg">
      <SpinnerIcon />
      <p className="text-lg text-cyan-300 font-semibold">{message}</p>
      {extraMessage && <p className="text-sm text-gray-400">{extraMessage}</p>}
    </div>
  );
};