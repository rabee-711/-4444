import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume success after the dialog is closed by the user.
        onKeySelected();
      } catch (e) {
        console.error("Error opening API key selection dialog:", e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl text-center bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">!أهلاً بك</h1>
        <p className="text-gray-300 mb-6">
          يستخدم هذا التطبيق نموذج فيو القوي لإنشاء مقاطع الفيديو. للمتابعة، يجب عليك تحديد مفتاح API مرتبط بمشروع تم تمكين الفوترة فيه.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          لمزيد من المعلومات حول الفوترة، يرجى زيارة{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            الوثائق الرسمية
          </a>.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
        >
          حدد مفتاح API الخاص بك
        </button>
      </div>
    </div>
  );
};