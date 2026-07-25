import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { serverURL } from "../main";
import {
  FaFileLines,
  FaBars,
  FaXmark,
  FaDiagramProject,
  FaChartColumn,
  FaDownload,
  FaTrash,
  FaCircleQuestion,
} from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import NotesView from "../components/NotesView";
import QuizModal from "../components/QuizModal";

function History() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);



  const [deleteTarget, setDeleteTarget] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleTakeQuiz = async () => {
    setQuizLoading(true);
    try {
      const result = await axios.post(
        `${serverURL}/api/notes/${selected._id}/quiz`,
        {},
        { withCredentials: true },
      );
      setQuiz(result.data.data.quiz);
      if (!result.data.data.cached) {
        dispatch(setUserData({ ...userData, credits: result.data.data.credits }));
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Could not generate quiz, try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${serverURL}/api/notes/${deleteTarget._id}`, {
        withCredentials: true,
      });
      setNotes(notes.filter((n) => n._id !== deleteTarget._id));
      if (selected?._id === deleteTarget._id) setSelected(null);
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    const myNotes = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/notes/my-notes`, {
          withCredentials: true,
        });
        setNotes(result.data.data.notes);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    myNotes();
  }, []);

  const handleDownloadPdf = async () => {
    const elem = document.getElementById("note-view-container");
    if (!elem) return window.print();

    try {
      elem.classList.add("is-pdf-export");
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${selected?.topic ? selected.topic.replace(/[^a-zA-Z0-9]/g, "_") : "NoteSprint"}_Notes.pdf`,
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
    <div className="min-h-screen bg-white">
      <Navbar isMyNotes={true} />
      <div className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] mt-3 flex flex-col gap-4 px-4 pb-16 md:flex-row md:items-start md:gap-6">
        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm md:hidden print:hidden"
        >
          {showSidebar ? <FaXmark /> : <FaBars />}
          My Notes ({notes.length})
        </button>

        <div
          className={`grid shrink-0 transition-[grid-template-rows] duration-300 ease-in-out md:sticky md:top-6 md:block md:w-64 print:hidden ${
            showSidebar ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
        <div className="overflow-hidden md:overflow-visible">
        <aside
          className={`w-full rounded-2xl border border-slate-200 bg-white p-3 transition-opacity duration-300 md:max-h-[80vh] md:overflow-y-auto md:opacity-100 ${
            showSidebar ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            My Notes ({notes.length})
          </p>
          {loading && (
            <p className="px-2 py-2 text-sm text-slate-500">Loading…</p>
          )}
          {!loading && notes.length === 0 && (
            <p className="px-2 py-2 text-sm text-slate-500">
              No notes generated yet.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                setSelected(note);
                setShowSidebar(false);
              }}
              className={`mb-1.5 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                selected?._id === note._id
                  ? "bg-amber-100/90 font-bold border border-amber-300"
                  : "bg-slate-50 hover:bg-amber-50/50"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    selected?._id === note._id
                      ? "text-amber-950"
                      : "text-slate-700"
                  }`}
                >
                  {note.topic}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  {note.includeDiagrams && (
                    <FaDiagramProject className="text-xs text-teal-500" />
                  )}
                  {note.includeCharts && (
                    <FaChartColumn className="text-xs text-amber-500" />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(note);
                }}
                className="shrink-0 cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </aside>
        </div>
        </div>

        <div className="min-w-0 flex-1">
          {selected ? (
            <div>
              <div className="mb-3 flex justify-end gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleTakeQuiz}
                  disabled={quizLoading}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-amber-400 border border-amber-400/40 shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {quizLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  ) : (
                    <FaCircleQuestion />
                  )}
                  {quizLoading ? "Preparing quiz..." : "Take Quiz (5 Credits)"}
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
              <NotesView note={selected} />
            </div>
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 px-6 text-center">
              <FaFileLines className="text-6xl text-slate-300" />
              <p className="text-lg sm:text-xl font-semibold text-slate-500">
                Select a note from the list to view it
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {quiz && (
          <QuizModal topic={selected?.topic} quiz={quiz} onClose={() => setQuiz(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FaTrash className="text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Delete this note?
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                “{deleteTarget.topic}” will be permanently deleted. This cannot
                be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 cursor-pointer rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 cursor-pointer rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default History;
