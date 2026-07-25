import { useState } from "react";
import { motion } from "framer-motion";
import { HiDocumentText, HiLightningBolt, HiChartBar, HiChartPie } from "react-icons/hi";

const TOGGLES = [
  { key: "revisionMode", label: "Revision mode", icon: HiDocumentText },
  { key: "includeDiagrams", label: "Include diagrams", icon: HiChartBar },
  { key: "includeCharts", label: "Include charts", icon: HiChartPie },
];

function TopicNotes({ onGenerate, loading, error }) {
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    detail: "standard",
    revisionMode: false,
    includeDiagrams: false,
    includeCharts: false,
  });
  const [formError, setFormError] = useState("");

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      setFormError("Please enter a topic to generate notes.");
      return;
    }
    setFormError("");
    onGenerate(form);
  };

  const message = formError || error;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-0 max-w-full rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-xl print:hidden"
    >
      <div className="flex items-start gap-5 border-b border-gray-100 pb-6">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center shadow-xs">
          <HiDocumentText className="w-10 h-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Generate Topic Notes
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mt-2">
            Describe what you want to study and let AI build your notes.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="topic" className="text-base font-semibold text-slate-800">
            Topic <span className="text-amber-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={form.topic}
            onChange={(e) => update("topic", e.target.value)}
            placeholder="e.g. Operating System Deadlocks"
            className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-5 text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label htmlFor="subject" className="text-base font-semibold text-slate-800">
              Subject (optional)
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="e.g. Computer Science"
              className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-5 text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="detail" className="text-base font-semibold text-slate-800">
              Detail level
            </label>
            <select
              id="detail"
              value={form.detail}
              onChange={(e) => update("detail", e.target.value)}
              className="mt-2 h-14 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="brief">Brief</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {TOGGLES.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              onClick={() => update(key, !form[key])}
              className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition cursor-pointer ${
                form[key]
                  ? "border-blue-300 bg-blue-50/80 shadow-2xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${form[key] ? "text-blue-600" : "text-slate-500"}`} />
                <span className={`text-base font-semibold ${form[key] ? "text-slate-900" : "text-slate-700"}`}>{label}</span>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form[key] ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {message && (
          <p className="rounded-xl bg-rose-50 p-3.5 text-center text-sm font-semibold text-rose-600 border border-rose-200">
            {message}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="mt-2 flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#FFC107] hover:bg-[#F4B400] text-slate-950 font-bold text-lg sm:text-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-3 border-slate-950 border-t-transparent" />
              <span>Generating Notes...</span>
            </>
          ) : (
            <>
              <HiLightningBolt className="h-6 w-6 text-slate-950" />
              <span>Generate Notes</span>
              <span className="ml-1 rounded-full bg-slate-950/10 px-2.5 py-0.5 text-xs font-extrabold text-slate-900 border border-slate-950/20">
                10 Credits
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default TopicNotes;
