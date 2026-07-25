import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";
import logo from "../assets/logo.svg";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  suppressErrorRendering: true,
});

const CHART_COLORS = ["#FFC107", "#111827", "#3B82F6", "#10B981", "#8B5CF6", "#F43F5E"];

const IMPORTANCE_STYLES = {
  high: "bg-rose-100 text-rose-700 border border-rose-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const SUBTOPIC_GROUPS = [
  { key: "frequentlyAsked", label: "Frequently Asked", style: "bg-blue-100 text-blue-900 border border-blue-200 font-semibold" },
  { key: "veryImportant", label: "Very Important", style: "bg-slate-900 text-white font-bold border border-slate-900 shadow-xs" },
  { key: "important", label: "Important", style: "bg-slate-100 text-slate-700 border border-slate-200" },
];

function MermaidDiagram({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!chart || !ref.current) return;
    const cleaned = chart
      .replace(/```mermaid|```/g, "")
      .replace(/\\n/g, " ")
      .replace(/\[([^\]]*)\]/g, (m, label) => `[${label.replace(/[^\w\s.,%+-]/g, " ").trim()}]`)
      .replace(/\|([^|]*)\|/g, (m, label) => `|${label.replace(/[^\w\s.,%+-]/g, " ").trim()}|`)
      .trim();
    mermaid
      .render(`note-diagram-${Math.random().toString(36).slice(2)}`, cleaned)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          const svgElem = ref.current.querySelector("svg");
          if (svgElem) {
            svgElem.style.maxWidth = "100%";
            svgElem.style.maxHeight = "240px";
            svgElem.style.width = "auto";
            svgElem.style.height = "auto";
            svgElem.style.margin = "0 auto";
            svgElem.style.display = "block";
          }
        }
      })
      .catch(() => {
        if (ref.current) ref.current.innerText = "Could not render diagram";
      });
  }, [chart]);

  return (
    <div className="flex justify-center items-center overflow-x-auto p-5 bg-slate-50/80 rounded-2xl border border-slate-200 min-h-[140px]">
      <div ref={ref} className="w-full flex justify-center items-center" />
    </div>
  );
}

function NoteChart({ chart }) {
  return (
    <div className="break-inside-avoid flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-xs" />
        <h4 className="text-base font-bold text-slate-900">{chart.title}</h4>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "pie" ? (
            <PieChart>
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={4}
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{ backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }}
                itemStyle={{ color: "#FFFFFF", fontWeight: "600" }}
                labelStyle={{ color: "#F8FAFC", fontWeight: "700" }}
              />
            </PieChart>
          ) : chart.type === "line" ? (
            <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis dataKey="name" fontSize={11} stroke="#64748B" interval={0} angle={-15} textAnchor="end" />
              <YAxis fontSize={11} stroke="#64748B" />
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }}
                itemStyle={{ color: "#FFFFFF", fontWeight: "600" }}
                labelStyle={{ color: "#F8FAFC", fontWeight: "700" }}
              />
              <Line type="monotone" dataKey="value" stroke="#FFC107" strokeWidth={3} dot={{ r: 5, fill: "#111827" }} />
            </LineChart>
          ) : (
            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis dataKey="name" fontSize={11} stroke="#64748B" interval={0} angle={-15} textAnchor="end" />
              <YAxis fontSize={11} stroke="#64748B" />
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }}
                itemStyle={{ color: "#FFFFFF", fontWeight: "600" }}
                labelStyle={{ color: "#F8FAFC", fontWeight: "700" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Custom Clean Legend for Pie Charts */}
      {chart.type === "pie" && (
        <div className="mt-4 border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
          {chart.data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="truncate">{item.name}: <strong className="text-slate-900">{item.value}%</strong></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const markdownStyles = {
  h1: (props) => <h1 className="mt-6 text-2xl font-bold text-slate-900 border-b pb-2 border-slate-200" {...props} />,
  h2: (props) => <h2 className="mt-5 text-xl font-bold text-slate-900" {...props} />,
  h3: (props) => <h3 className="mt-4 text-lg font-semibold text-slate-800" {...props} />,
  p: (props) => <p className="mt-2 text-base text-slate-700 leading-relaxed" {...props} />,
  ul: (props) => <ul className="mt-2 list-disc pl-6 text-base text-slate-700 space-y-1" {...props} />,
  ol: (props) => <ol className="mt-2 list-decimal pl-6 text-base text-slate-700 space-y-1" {...props} />,
  li: (props) => <li className="mt-1" {...props} />,
  strong: (props) => (
    <strong
      className="font-bold text-slate-900 bg-blue-50/90 border border-blue-200/70 px-1.5 py-0.5 rounded text-[0.95em]"
      {...props}
    />
  ),
};

function NotesView({ note }) {
  const content = note?.content;
  if (!content) return null;

  return (
    <div id="note-view-container" className="flex flex-col gap-8 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-xl">
      {/* Sleek Notion/Gamma style document header */}
      <div className="hidden print:flex is-pdf-export:flex items-center justify-between border-b border-slate-200/90 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NoteSprint AI" className="h-6 w-auto" />
          <span className="h-4 w-px bg-slate-300" />
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-800">
            EXAM STUDY NOTES
          </span>
        </div>
        <div className="text-right text-xs font-semibold text-slate-500">
          notesprint-ai.vercel.app
        </div>
      </div>

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900">
            {note.topic}
          </h2>
          {note.subject && (
            <p className="mt-1 text-sm font-medium text-slate-500">
              Subject: {note.subject}
            </p>
          )}
        </div>
        {content.importance && (
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
              IMPORTANCE_STYLES[content.importance] || IMPORTANCE_STYLES.low
            }`}
          >
            {content.importance} Importance
          </span>
        )}
      </div>

      {/* sub topics */}
      {SUBTOPIC_GROUPS.some((g) => content.subTopics?.[g.key]?.length > 0) && (
        <div id="note-subtopics" className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
          {SUBTOPIC_GROUPS.map(
            ({ key, label, style }) =>
              content.subTopics?.[key]?.length > 0 && (
                <div key={key}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {label} Subtopics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {content.subTopics[key].map((t) => (
                      <span
                        key={t}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs ${style}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      )}

      {/* notes body */}
      <div id="note-body" className="prose max-w-none">
        <ReactMarkdown components={markdownStyles}>
          {content.notes?.replace(/\\n/g, "\n")}
        </ReactMarkdown>
      </div>

      {/* revision points */}
      {content.revisionPoints?.length > 0 && (
        <div id="note-revision" className="break-inside-avoid rounded-3xl bg-blue-50/70 border border-blue-200 p-6 shadow-xs">
          <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">
            <span>⚡</span> Quick Revision Sheet
          </h3>
          <ul className="mt-3 list-disc pl-5 text-base text-slate-800 space-y-1.5">
            {content.revisionPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* questions */}
      {(content.questions?.short?.length > 0 ||
        content.questions?.long?.length > 0) && (
        <div id="note-questions" className="grid gap-6 sm:grid-cols-2">
          {content.questions.short?.length > 0 && (
            <div className="break-inside-avoid rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">
                Short Questions
              </h3>
              <ul className="mt-3 list-decimal pl-5 text-sm text-slate-700 space-y-2">
                {content.questions.short.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {content.questions.long?.length > 0 && (
            <div className="break-inside-avoid rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">
                Long Questions
              </h3>
              <ul className="mt-3 list-decimal pl-5 text-sm text-slate-700 space-y-2">
                {content.questions.long.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* diagram */}
      {content.diagram && (
        <div id="note-diagram" className="break-inside-avoid rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🧭</span> Flow Diagram
          </h3>
          <MermaidDiagram chart={content.diagram} />
        </div>
      )}

      {/* charts - rendered side by side in a 2-column grid */}
      {content.charts?.length > 0 && (
        <div id="note-charts" className="grid gap-6 md:grid-cols-2">
          {content.charts.map((chart) => (
            <NoteChart key={chart.title} chart={chart} />
          ))}
        </div>
      )}

      {/* Sleek Notion/Gamma style document footer */}
      <div className="hidden print:flex is-pdf-export:flex items-center justify-between border-t border-slate-200/80 pt-3 mt-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <span>Generated with NoteSprint AI</span>
          <span>•</span>
          <span>{note.subject || "Exam Study Notes"}</span>
        </div>
        <div>
          www.notesprint-ai.vercel.app
        </div>
      </div>
    </div>
  );
}

export default NotesView;
