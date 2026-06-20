// src/app/multiple-choices/page.tsx
'use client';

import { useState, useEffect, FC } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { Exo_2, Orbitron } from 'next/font/google';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const quizQuestions = Array.from({ length: 30 }, (_, i) => ({
  question: `Apa nama acara yang Anda ikuti?`,
  options: ["EXERTION", "COMPETITION", "CONFERENCE", "WORKSHOP"],
  correctAnswer: "EXERTION",
}));

const BackgroundShape = ({ className }: { className?: string }) => (
    <svg className={clsx("absolute z-0 opacity-10", className)} width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0L95.26 25V75L50 100L4.74 75V25L50 0Z" stroke="white" strokeWidth="2"/>
    </svg>
);

const MultipleChoicePage: FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [showResults, setShowResults] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  useEffect(() => {
    const savedTime = localStorage.getItem('quizTimeLeft');
    if (savedTime && !isNaN(parseInt(savedTime, 10))) {
      setTimeLeft(parseInt(savedTime, 10));
    }

    const savedAnswers = localStorage.getItem('quizSelectedAnswers');
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
    
    setIsDataInitialized(true);
  }, []);

  useEffect(() => {
    if (!isDataInitialized || showResults) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        localStorage.setItem('quizTimeLeft', newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDataInitialized, showResults]);

  useEffect(() => {
    if (isDataInitialized) {
        localStorage.setItem('quizSelectedAnswers', JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, isDataInitialized]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    if (selectedAnswers[currentQuestionIndex] === option) {
      const newSelectedAnswers = { ...selectedAnswers };
      delete newSelectedAnswers[currentQuestionIndex];
      setSelectedAnswers(newSelectedAnswers);
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIndex]: option,
      });
    }
  };

  const handleNextClick = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  const calculateScore = () => {
     return quizQuestions.reduce((total, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? total + 1 : total;
    }, 0);
  }

  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === quizQuestions.length;

  return (
    <div className={clsx("min-h-screen bg-gradient-to-t from-[#2A5B6A] via-[#3A405A] to-[#1E2A47] text-white flex flex-col p-8 box-border relative overflow-hidden", exo2.className)}>
      <BackgroundShape className="top-[10%] left-[15%] rotate-[15deg]" />
      <BackgroundShape className="bottom-[15%] right-[10%] -rotate-[25deg]" />

      <header className="flex justify-between items-center w-full z-10">
        <Image 
          src="/logo.svg" 
          alt="Exertion Logo" 
          width={150} 
          height={28} 
        />
        <Image
          src="/mascot-shai.svg"
          alt="Mascot"
          width={60}
          height={60}
        />
      </header>

      {showResults ? (
        <div className="flex-1 flex flex-col justify-center items-center z-10">
            <h1 className="text-4xl font-bold">Quiz Finished!</h1>
            <p className="text-2xl my-4">Your Score: {calculateScore()} / {quizQuestions.length}</p>
            <button 
                onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    const newTime = 30 * 60;
                    setTimeLeft(newTime);
                    localStorage.setItem('quizTimeLeft', newTime.toString());
                    localStorage.removeItem('quizSelectedAnswers');
                }}
                className="bg-slate-800 text-white px-10 py-4 rounded-lg border border-slate-600 cursor-pointer text-base"
            >
                Retake Quiz
            </button>
        </div>
      ) : (
        <main className="flex-1 flex justify-between gap-8 mt-8 z-10">
          <aside className="flex-none w-40">
            <div className="flex flex-col items-center">
              <p className={clsx("mb-2 uppercase text-sm tracking-wider", orbitron.className)}>DOWN123</p>
              <div className="bg-black/40 p-4 rounded-lg shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] w-full">
                <div className="grid grid-cols-4 gap-2">
                  {quizQuestions.map((_, index) => {
                    const isCurrent = currentQuestionIndex === index;
                    const isAnswered = selectedAnswers[index] !== undefined;
                    return (
                        <button
                        key={index}
                        onClick={() => handleQuestionSelect(index)}
                        className={clsx(
                            'aspect-square border border-slate-600 rounded-md cursor-pointer text-xs p-0 transition-colors',
                            exo2.className,
                            {
                                'bg-cyan-500 text-white': isCurrent,
                                'bg-sky-700 text-white': !isCurrent && isAnswered,
                                'bg-gray-300 text-black': !isCurrent && !isAnswered,
                            }
                        )}
                        >
                        {index + 1}
                        </button>
                    );
                  })}
                </div>
                <p className={clsx("mt-6 text-left text-xs", orbitron.className)}>
                    Time Left: <span className="font-bold">{formatTime(timeLeft)}</span>
                </p>
              </div>
            </div>
          </aside>

          <section className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="font-normal text-2xl">
                {currentQuestionIndex + 1}. {quizQuestions[currentQuestionIndex].question}
              </h2>
              <div className="flex flex-col gap-4 mt-8">
                {quizQuestions[currentQuestionIndex].options.map(option => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={clsx(
                          'text-white px-5 py-4 rounded-lg text-left text-base cursor-pointer transition-all ease-in-out border duration-500',
                          {
                              'bg-cyan-500 border-cyan-400 shadow-[0px_0px_15px_rgba(0,205,205,0.5)]': isSelected,
                              'bg-slate-800/80 border-slate-700 shadow-[0px_1px_2px_rgba(255,255,255,0.1)] hover:bg-slate-700/80': !isSelected,
                          }
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end mt-4">
                <button
                onClick={handleNextClick}
                disabled={isLastQuestion && !allQuestionsAnswered}
                className="bg-slate-800 text-white px-16 py-3 rounded-lg border border-slate-600 cursor-pointer text-base transition-opacity disabled:opacity-50"
                >
                {isLastQuestion ? 'Submit' : 'Next'}
                </button>
            </div>
          </section>

          <aside className="flex-none w-15"></aside>
        </main>
      )}
    </div>
  );
};

export default MultipleChoicePage;