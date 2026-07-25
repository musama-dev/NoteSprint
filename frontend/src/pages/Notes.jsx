import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { serverURL } from "../main";
import { setUserData } from "../redux/userSlice";
import { FaFileLines, FaDownload, FaCircleQuestion } from "react-icons/fa6";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import TopicNotes from "../components/TopicNotes";
import NotesView from "../components/NotesView";
import QuizModal from "../components/QuizModal";

function AppleRadialSpinner({ className = "h-8 w-8 text-slate-800" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 100 100" fill="currentColor">
      {[...Array(12)].map((_, i) => (
        <rect
          key={i}
          x="46"
          y="10"
          width="8"
          height="24"
          rx="4"
          transform={`rotate(${i * 30} 50 50)`}
          opacity={0.15 + (i / 12) * 0.85}
        />
      ))}
    </svg>
  );
}

function Notes() {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const content = notes?.content;
  const sections = notes
    ? [
        { id: "note-subtopics", label: "Important Topics" },
        { id: "note-body", label: "Notes" },
        content?.revisionPoints?.length > 0 && {
          id: "note-revision",
          label: "Quick Revision",
        },
        (content?.questions?.short?.length > 0 ||
          content?.questions?.long?.length > 0) && {
          id: "note-questions",
          label: "Questions",
        },
        content?.diagram && { id: "note-diagram", label: "Diagram" },
        content?.charts?.length > 0 && { id: "note-charts", label: "Charts" },
      ].filter(Boolean)
    : [];

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };



  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const handleTakeQuiz = async () => {
    setQuizLoading(true);
    try {
      const result = await axios.post(
        `${serverURL}/api/notes/${notes._id}/quiz`,
        {},
        { withCredentials: true },
      );
      setQuiz(result.data.data.quiz);
      if (!result.data.data.cached) {
        dispatch(setUserData({ ...userData, credits: result.data.data.credits }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate quiz, try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  const generateNotes = async (form) => {
    setError("");
    setLoading(true);
    setProgress(5);
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 3, 95));
    }, 600);
    try {
      const result = await axios.post(`${serverURL}/api/notes/generate`, form, {
        withCredentials: true,
      });
      setNotes(result.data.data.note);
      dispatch(setUserData({ ...userData, credits: result.data.data.credits }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while generating notes. Please try again.",
      );
    } finally {
      clearInterval(timer);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownloadPdf = async () => {
    const elem = document.getElementById("note-view-container");
    if (!elem) return window.print();

    try {
      elem.classList.add("is-pdf-export");
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${notes?.topic ? notes.topic.replace(/[^a-zA-Z0-9]/g, "_") : "NoteSprint"}_Notes.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#FFFFFF" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };
      await html2pdf().set(opt).from(elem).save();
    } catch (err) {
      console.log("html2pdf fallback:", err);
      window.print();
    } finally {
      elem.classList.remove("is-pdf-export");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12 pt-0.5">
      <Navbar />
      <div className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] px-4 pb-16">
        <div className="print:hidden">
          <TopicNotes onGenerate={generateNotes} loading={loading} error={error} />
        </div>
        {loading && (
          <div className="mx-auto mt-8 w-full max-w-2xl rounded-3xl border border-blue-200/80 bg-gradient-to-b from-blue-50/70 to-white p-6 shadow-xl print:hidden">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100/90 text-slate-900 border border-blue-300 shadow-xs">
                  <AppleRadialSpinner className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Building NoteSprint AI Notes</h4>
                  <p className="text-xs font-semibold text-slate-600 transition-all duration-300">
                    {progress < 25
                      ? "🔍 Analyzing study topic & core concepts..."
                      : progress < 55
                      ? "⚡ Compiling exam definitions & revision points..."
                      : progress < 80
                      ? "📊 Generating flow diagrams & charts..."
                      : "✨ Formatting final exam-ready study notes..."}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-900 border border-blue-300 shadow-xs">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 border border-slate-300/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-300 shadow-xs"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className={`py-1.5 rounded-xl border transition ${progress >= 10 ? 'bg-blue-100 border-blue-300 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                1. Analyze
              </div>
              <div className={`py-1.5 rounded-xl border transition ${progress >= 35 ? 'bg-blue-100 border-blue-300 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                2. Compile
              </div>
              <div className={`py-1.5 rounded-xl border transition ${progress >= 65 ? 'bg-blue-100 border-blue-300 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                3. Visuals
              </div>
              <div className={`py-1.5 rounded-xl border transition ${progress >= 85 ? 'bg-blue-100 border-blue-300 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                4. Finalize
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex w-full items-start gap-6">
          {notes && (
            <aside className="sticky top-6 hidden w-48 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 md:block print:hidden">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                On this page
              </p>
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                    activeSection === id
                      ? "bg-blue-50 font-bold text-blue-900 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </aside>
          )}
          <div className="min-w-0 flex-1">
          {notes ? (
            <div>
              <div className="mb-3 flex justify-end gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleTakeQuiz}
                  disabled={quizLoading}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-amber-400 border border-amber-400/40 shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {quizLoading ? (
                    <AppleRadialSpinner className="h-4 w-4 text-amber-400" />
                  ) : (
                    <FaCircleQuestion />
                  )}
                  {quizLoading ? "Generating Quiz..." : "Take Quiz (5 Credits)"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <FaDownload className="text-amber-500" />
                  Download PDF
                </button>
              </div>
              <NotesView note={notes} />
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/40 py-24 flex flex-col items-center justify-center text-center">
              <FaFileLines className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-lg font-bold text-slate-800">
                Generated notes will appear here
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Fill the form above and hit Generate Notes to get started
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {quiz && (
          <QuizModal topic={notes?.topic} quiz={quiz} onClose={() => setQuiz(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notes;
