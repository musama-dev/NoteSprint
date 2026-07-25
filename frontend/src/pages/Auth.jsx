import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  FaGraduationCap,
  FaClipboardList,
  FaChartPie,
  FaCircleQuestion,
  FaFilePdf,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import logo from "../assets/logo.svg";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { serverURL } from "../main";
import axios from "axios";
import HowItWorks from "../components/HowItWorks";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const FEATURES = [
  { label: "Exam Notes", Icon: FaGraduationCap, color: "from-amber-500 to-amber-600" },
  { label: "Project Notes", Icon: FaClipboardList, color: "from-slate-800 to-slate-950" },
  { label: "Charts", Icon: FaChartPie, color: "from-amber-500 to-yellow-500" },
  { label: "MCQ Quizzes", Icon: FaCircleQuestion, color: "from-amber-500 to-amber-600" },
  { label: "PDFs", Icon: FaFilePdf, color: "from-slate-800 to-slate-950" },
  { label: "And More", Icon: FaWandMagicSparkles, color: "from-amber-500 to-yellow-500" },
];

function Auth() {
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const User = response.user;
      const name = User.displayName;
      const email = User.email;

      const result = await axios.post(
        `${serverURL}/api/auth/google`,
        { name, email },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data.data));
    } catch (error) {
      console.error("Google Auth Error:", error);
      if (error.code === "auth/operation-not-allowed") {
        alert("Google Sign-in Enable Nahi Hai!\n\nFix: Firebase Console -> Authentication -> Sign-in method -> Google Enable karein.");
      } else if (error.code === "auth/unauthorized-domain") {
        alert("Unauthorized Domain!\n\nFix: Firebase Console -> Authentication -> Settings -> Authorized domains mein 'localhost' add karein.");
      } else if (error.code !== "auth/popup-closed-by-user") {
        alert(`Firebase Auth Error [${error.code || 'unknown'}]:\n${error.message || 'Google Sign-In Failed'}`);
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50/50">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] mt-4 sm:mt-6 md:mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-white/80 backdrop-blur-md px-5 sm:px-8 py-3.5 shadow-sm border border-slate-200/80"
      >
        <motion.img
          src={logo}
          alt="NoteSprint AI"
          className="h-8 sm:h-10 w-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{
            scale: 1.03,
            transition: { type: "spring", stiffness: 400, damping: 17 },
          }}
        />
        <motion.p
          className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          ⚡ High-Speed AI Study Partner
        </motion.p>
      </motion.header>

      <main className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] mt-10 sm:mt-16 md:mt-20 flex flex-col md:flex-row items-center md:items-start gap-12 px-4 pb-12 md:pb-16">
        <div className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 shadow-xs"
          >
            <span>🎉 Get 50 Free Credits Instantly</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Turn Any Topic Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
              Exam-Ready Notes
            </span>{" "}
            in Seconds.
          </h1>

          <p className="mt-4 max-w-lg text-sm sm:text-base text-slate-600 leading-relaxed">
            Generate detailed study notes, flow diagrams, Recharts visual data, and 10-question MCQ practice quizzes with one click.
          </p>

          <motion.button
            onClick={handleGoogleAuth}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{
              scale: 1.03,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            whileTap={{
              scale: 0.97,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className="mt-8 flex w-full max-w-xs sm:w-auto justify-center items-center gap-3 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-slate-800 shadow-md transition-all duration-300 hover:shadow-xl hover:border-amber-300 hover:bg-slate-50 cursor-pointer"
          >
            <FcGoogle className="text-xl sm:text-2xl" />
            Continue with Google
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-4 max-w-md text-xs text-slate-500"
          >
            Start with <span className="font-bold text-amber-600">50 free credits</span> • Instant Access • No credit card required
          </motion.p>
        </div>

        <div className="w-full md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4 perspective-[1000px]">
          {FEATURES.map(({ label, Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
              whileHover={{
                rotateX: 8,
                rotateY: -8,
                scale: 1.05,
                transition: { type: "spring", stiffness: 300, damping: 15 },
              }}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br ${color} p-5 sm:p-6 text-white shadow-lg shadow-slate-200/50 transform-3d cursor-default border border-white/10`}
            >
              <span className="transform-[translateZ(24px)]">
                <Icon className="text-2xl sm:text-3xl text-white" />
              </span>
              <span className="text-xs sm:text-sm font-bold transform-[translateZ(12px)] tracking-wide">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </main>

      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}

export default Auth;
