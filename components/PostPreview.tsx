import React, { useState, useEffect } from 'react';
import type { PostContent } from '../types';
import { FacebookIcon, InstagramIcon, XIcon, LinkedInIcon, ShareIcon, SpinnerIcon, PlayIcon } from './icons';

interface PostPreviewProps {
  content: PostContent;
  originalPrompt: string;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ content, originalPrompt }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [platform, setPlatform] = useState('');

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(true);

  useEffect(() => {
    // Reset state when content changes
    setIsPlaying(false);
    setThumbnailUrl(null);
    setIsGeneratingThumbnail(true);

    const generateThumbnail = (videoSrc: string) => {
        try {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.crossOrigin = "anonymous";
            
            video.addEventListener('loadeddata', () => {
                // Seek to a frame. 1s is a good choice.
                video.currentTime = 1;
            });

            video.addEventListener('seeked', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    setThumbnailUrl(dataUrl);
                } else {
                   throw new Error('Could not get canvas context');
                }
                setIsGeneratingThumbnail(false);
            });

            video.addEventListener('error', (e) => {
                console.error('Error loading video for thumbnail generation:', e);
                setIsGeneratingThumbnail(false); // Stop loading state on error
            });

        } catch (error) {
            console.error("Failed to generate thumbnail", error);
            setIsGeneratingThumbnail(false);
        }
    };

    if (content.videoUrl) {
        generateThumbnail(content.videoUrl);
    }
  }, [content.videoUrl]);

  const handleShare = (platformName: string) => {
    setPlatform(platformName);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  }

  return (
    <div className="bg-gray-800/70 p-6 rounded-2xl shadow-xl border border-gray-700 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">منشورك الذي تم إنشاؤه بواسطة الذكاء الاصطناعي</h2>
      <p className="text-sm text-gray-400 mb-6 italic">بناءً على طلبك: "{originalPrompt}"</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Media */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-200">الصورة المُنشأة</h3>
            <img src={content.imageUrl} alt="AI generated" className="rounded-lg w-full object-cover shadow-lg" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-200">الفيديو المُنشأ</h3>
            <div className="relative rounded-lg overflow-hidden shadow-lg w-full aspect-[9/16] bg-black">
              {isPlaying ? (
                <video
                  src={content.videoUrl}
                  controls
                  autoPlay
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center">
                      <SpinnerIcon />
                      <span className="mt-2 text-gray-300 text-sm">...جارٍ إنشاء معاينة مصغرة</span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-300 disabled:cursor-not-allowed group"
                    aria-label="Play video"
                    disabled={isGeneratingThumbnail}
                  >
                    {!isGeneratingThumbnail && <PlayIcon />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Caption & Share */}
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-gray-200">التعليق المُنشأ</h3>
          <div className="bg-gray-700/50 p-4 rounded-lg flex-grow mb-6">
            <p className="text-gray-300 whitespace-pre-wrap">{content.caption}</p>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-700">
             <h3 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2"><ShareIcon /> ...مشاركة إلى</h3>
              <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleShare('Instagram')} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                      <InstagramIcon /> Instagram
                  </button>
                  <button onClick={() => handleShare('Facebook')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                      <FacebookIcon /> Facebook
                  </button>
                  <button onClick={() => handleShare('X (Twitter)')} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                      <XIcon /> X
                  </button>
                  <button onClick={() => handleShare('LinkedIn')} className="flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                      <LinkedInIcon /> LinkedIn
                  </button>
              </div>
              {showConfirmation && (
                  <div className="mt-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded-lg text-center animate-fade-in">
                      !تمت مشاركة المحتوى على {platform} (محاكاة)
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};