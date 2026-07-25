import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaClipboardList,
  FaChartPie,
  FaDiagramProject,
  FaFilePdf,
  FaWandMagicSparkles,
} from "react-icons/fa6";

const FEATURES = [
  {
    Icon: FaGraduationCap,
    title: "Exam Notes",
    desc: "Chapter-wise, exam-focused notes with key points, definitions and solved examples.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    Icon: FaClipboardList,
    title: "Project Documentation",
    desc: "Clean, structured documentation for projects, assignments and reports.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    Icon: FaChartPie,
    title: "Smart Charts",
    desc: "Turn data and comparisons into clear, ready-to-use visual charts.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    Icon: FaDiagramProject,
    title: "Flow Diagrams",
    desc: "Flowcharts and diagrams that explain complex topics at a glance.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    Icon: FaFilePdf,
    title: "PDF Export",
    desc: "Download everything as polished, share-ready PDF files in one click.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    Icon: FaWandMagicSparkles,
    title: "Revision & Quizzes",
    desc: "Quick revision sheets plus 10-question MCQ quizzes with explanations to test yourself before exam day.",
    color: "bg-emerald-100 text-emerald-600",
  },
];

function Features() {
  return (
    <section className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] mt-20 sm:mt-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
          Everything you need to study smarter
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-500">
          One AI, every study format — generated in seconds from any topic.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Icon, title, desc, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            whileHover={{
              y: -6,
              transition: { type: "spring", stiffness: 300, damping: 18 },
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${color}`}
            >
              <Icon />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Features;
