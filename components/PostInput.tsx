import React from 'react';
import { GenerateIcon } from './icons';

interface PostInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PostInput: React.FC<PostInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-200">
        ما هو موضوع منشورك؟
      </label>
      <textarea
        id="prompt-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="...مثال: مدينة نيون مستقبلية في الليل، مع سيارات طائرة"
        className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg p-3 h-24 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto self-end flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 shadow-lg"
      >
        <GenerateIcon />
        {isLoading ? '...جارٍ الإنشاء' : 'أنشئ المنشور'}
      </button>
    </form>
  );
};