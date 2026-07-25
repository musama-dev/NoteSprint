import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaXmark } from "react-icons/fa6";

function QuizModal({ topic, quiz, onClose }) {
  const questions = quiz?.questions || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const pick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answerIndex) setScore(score + 1);
  };

  const next = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  const retry = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const optionStyle = (i) => {
    if (selected === null)
      return "border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer";
    if (i === q.answerIndex) return "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
    if (i === selected) return "border-rose-400 bg-rose-50 text-rose-800 font-semibold";
    return "border-slate-200 bg-white opacity-60";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-2xl"
      >
        {finished ? (
          <div className="text-center">
            <p className="text-5xl">
              {score >= questions.length * 0.8 ? "🏆" : score >= questions.length * 0.5 ? "👏" : "📖"}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              {score} / {questions.length}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {score >= questions.length * 0.8
                ? "Excellent! You know this topic well."
                : score >= questions.length * 0.5
                  ? "Good work — review the ones you missed."
                  : "Keep studying — read the notes once more and retry."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={retry}
                className="flex-1 cursor-pointer rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 shadow-sm"
              >
                Retry Quiz
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {topic} · Question {index + 1} of {questions.length}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300 shadow-xs"
                style={{ width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="mt-5 text-base sm:text-lg font-bold text-slate-900">
                  {q.question}
                </h3>

                <div className="mt-4 flex flex-col gap-2.5">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${optionStyle(i)}`}
                    >
                      {opt}
                      {selected !== null && i === q.answerIndex && (
                        <FaCheck className="shrink-0 text-emerald-600" />
                      )}
                      {selected !== null && i === selected && i !== q.answerIndex && (
                        <FaXmark className="shrink-0 text-rose-500" />
                      )}
                    </button>
                  ))}
                </div>

                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200 px-4 py-3 text-sm text-slate-800"
                  >
                    <p className="font-semibold text-amber-950 mb-0.5">Explanation:</p>
                    {q.explanation}
                  </motion.div>
                )}

                {selected !== null && (
                  <button
                    type="button"
                    onClick={next}
                    className="mt-5 w-full cursor-pointer rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 border border-amber-400/30 shadow-md"
                  >
                    {isLast ? "See Score" : "Next Question"}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default QuizModal;
