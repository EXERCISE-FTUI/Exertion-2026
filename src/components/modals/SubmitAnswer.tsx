import React from "react";

interface SubmitAnswerProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

const SubmitAnswer: React.FC<SubmitAnswerProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl px-8 pt-8 pb-6 min-w-[400px] max-w-[95vw] min-h-[160px] text-left relative font-sans">
        <div className="font-bold text-[20px] mb-2">
          Submit all your answer and finish?
        </div>
        <hr className="border-t border-gray-400 mb-3 mt-0" />
        <div className="text-[15px] text-[#222] mb-3">
          Once you submit your answer, you won't be able to change them.
        </div>
        <hr className="border-t border-gray-200 mt-3 mb-0" />
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white rounded-lg px-7 py-2 text-[16px] font-medium hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onSubmit}
            className="bg-[#19213D] text-white rounded-lg px-7 py-2 text-[16px] font-medium hover:bg-[#101426] transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitAnswer; 