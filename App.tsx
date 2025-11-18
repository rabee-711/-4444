import React, { useState, useEffect, useCallback } from 'react';
import type { PostContent, LoadingState } from './types';
import { generateCaption, generateImage, generateVideo } from './services/geminiService';
import { ApiKeySelector } from './components/ApiKeySelector';
import { PostInput } from './components/PostInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { PostPreview } from './components/PostPreview';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
  const [apiKeyChecked, setApiKeyChecked] = useState<boolean>(false);

  const [prompt, setPrompt] = useState<string>('');
  const [postContent, setPostContent] = useState<PostContent | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsApiKeySelected(hasKey);
    }
    setApiKeyChecked(true);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleGeneratePost = async () => {
    if (!prompt.trim()) {
      setError('الرجاء إدخال موضوع لمنشورك.');
      return;
    }
    setError(null);
    setPostContent(null);
    
    try {
      setLoadingState({ isLoading: true, message: '...تهيئة الذكاء الاصطناعي' });

      const captionPromise = generateCaption(prompt);
      const imagePromise = generateImage(prompt);
      
      setLoadingState({ isLoading: true, message: '...جارٍ إنشاء تعليق جذاب' });
      const caption = await captionPromise;

      setLoadingState({ isLoading: true, message: '...جارٍ تصميم صورة مذهلة باستخدام نانو بنانا' });
      const imageUrl = await imagePromise;

      setLoadingState({ isLoading: true, message: '...جارٍ إخراج فيديو احترافي باستخدام فيو... قد يستغرق هذا بضع دقائق' });
      const videoUrl = await generateVideo(prompt);

      setPostContent({ caption, imageUrl, videoUrl });
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
      if (err.message) {
          errorMessage = `خطأ: ${err.message}`;
      }
      if (err.message && err.message.includes('Requested entity was not found.')) {
        errorMessage = "يبدو أن مفتاح API الخاص بك غير صالح. الرجاء تحديد مفتاح صالح.";
        setIsApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setLoadingState({ isLoading: false, message: '' });
    }
  };
  
  const handleApiKeySelected = () => {
    setIsApiKeySelected(true);
  };

  if (!apiKeyChecked) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
              <LoadingIndicator message="...جارٍ التحقق من حالة مفتاح API"/>
          </div>
      );
  }

  if (!isApiKeySelected) {
    return <ApiKeySelector onKeySelected={handleApiKeySelected} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-center sm:justify-end gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            مولد منشورات التواصل الاجتماعي
          </h1>
          <LogoIcon />
        </header>

        <main>
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 mb-8">
            <PostInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleGeneratePost}
              isLoading={loadingState.isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-8 text-center">
              {error}
            </div>

          )}

          {loadingState.isLoading && <LoadingIndicator message={loadingState.message} />}

          {postContent && !loadingState.isLoading && (
            <PostPreview content={postContent} originalPrompt={prompt} />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;