import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins, FaPlus } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverURL } from "../main";
import { setUserData } from "../redux/userSlice";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Navbar({isMyNotes = false,isPaymentPage=false}) {
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post(
        `${serverURL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.0, ease: "easeOut" }}
      className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] mt-2 sm:mt-3 mb-3 flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 shadow-sm border border-slate-200/80 print:hidden"
    >
      <img onClick={()=>navigate("/")} src={logo} alt="NoteSprint AI" className="h-10 sm:h-12 md:h-14 w-auto cursor-pointer" />

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
          <motion.div
            onClick={() => {
              setShowBuyCredits(!showBuyCredits);
              setShowProfile(false);
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{
              scale: 1.04,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            whileTap={{
              scale: 0.96,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3.5 sm:px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-2xs cursor-pointer hover:bg-slate-100"
          >
            <FaCoins className="text-amber-500" />
            {userData?.credits}
            <button
              type="button"
              className="text-amber-600 hover:text-amber-700"
            >
              <FaPlus />
            </button>
          </motion.div>

          <AnimatePresence>
          {showBuyCredits && !isPaymentPage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            >
              <h3 className="font-bold text-slate-900">Buy credits</h3>
              <p className="mt-1 text-xs text-slate-500">
                Use credits to generate PDFs, notes, AI diagrams and much more.
              </p>
              <button
                onClick={()=>navigate("/pricing")}
                type="button"
                className="mt-3 w-full cursor-pointer rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-500 shadow-xs"
              >
                Buy More Credits
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowBuyCredits(false);
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{
              scale: 1.04,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            whileTap={{
              scale: 0.96,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-900 text-sm sm:text-base font-bold text-amber-400 shadow-xs border border-amber-400/40 cursor-pointer"
          >
            {userData?.name?.[0]?.toUpperCase() || "U"}
          </motion.div>

          <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-10 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              {!isMyNotes ? <button
                onClick={()=>navigate("/history")}
                type="button"
                className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-amber-50"
              >
                My Notes
              </button>:<button
                onClick={()=>navigate("/notes")}
                type="button"
                className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-amber-50"
              >
                Create Notes
              </button>}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
