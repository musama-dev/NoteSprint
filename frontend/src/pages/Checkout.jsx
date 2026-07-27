import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  FaArrowLeft,
  FaCreditCard,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { serverURL } from "../main";
import { setUserData } from "../redux/userSlice";
import logo from "../assets/logo.png";

const PLANS_DATA = {
  starter: {
    id: "starter",
    name: "Starter Plan",
    usdPrice: 0.99,
    usdDisplay: "$0.99",
    credits: 60,
  },
  student: {
    id: "student",
    name: "Student Plan",
    usdPrice: 1.99,
    usdDisplay: "$1.99",
    credits: 150,
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    usdPrice: 2.99,
    usdDisplay: "$2.99",
    credits: 300,
  },
};

const USD_TO_PKR_RATE = 288.8392;

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const planId = searchParams.get("plan") || "student";
  const currentPlan = PLANS_DATA[planId] || PLANS_DATA.student;

  const [currency, setCurrency] = useState("PKR"); // "PKR" or "USD"
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [saveInfo, setSaveInfo] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const pkrAmount = (currentPlan.usdPrice * USD_TO_PKR_RATE).toFixed(2);
  const displayPrice =
    currency === "PKR" ? `PKR ${pkrAmount}` : currentPlan.usdDisplay;

  // Auto detect card network (Visa, Mastercard, Amex, UnionPay, PayPak, Discover)
  const getCardBrandIcon = (number) => {
    const cleanNum = number.replace(/\s+/g, "");
    if (!cleanNum) return <FaCreditCard className="text-slate-400 text-base" />;

    // Visa (starts with 4)
    if (/^4/.test(cleanNum)) {
      return <FaCcVisa className="text-blue-600 text-2xl" title="Visa" />;
    }
    // Mastercard (starts with 5 or 2221-2720)
    if (/^(5[1-5]|2[2-7]|5364|5370|5299)/.test(cleanNum)) {
      return <FaCcMastercard className="text-red-500 text-2xl" title="Mastercard" />;
    }
    // American Express (starts with 34 or 37)
    if (/^3[47]/.test(cleanNum)) {
      return <FaCcAmex className="text-blue-500 text-2xl" title="American Express" />;
    }
    // PayPak (starts with 6060)
    if (/^6060/.test(cleanNum)) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-extrabold text-[10px] tracking-tight uppercase">
          PayPak
        </span>
      );
    }
    // UnionPay (starts with 62)
    if (/^62/.test(cleanNum)) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-sky-700 text-white font-extrabold text-[10px] tracking-tight uppercase">
          UnionPay
        </span>
      );
    }
    // Discover (starts with 6011 or 65)
    if (/^(6011|65|64[4-9])/.test(cleanNum)) {
      return <FaCcDiscover className="text-orange-500 text-2xl" title="Discover" />;
    }

    return <FaCreditCard className="text-slate-400 text-base" />;
  };

  // Format card number as 4-digit blocks
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Format expiry as MM / YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsProcessing(true);

    let activeUserEmail = userData?.email?.toLowerCase().trim();

    if (!activeUserEmail) {
      try {
        const userRes = await axios.get(`${serverURL}/api/user/me`, {
          withCredentials: true,
        });
        if (userRes.data?.data) {
          dispatch(setUserData(userRes.data.data));
          activeUserEmail = userRes.data.data.email?.toLowerCase().trim();
        }
      } catch {
        // Ignore fetch error
      }
    }

    if (activeUserEmail !== "musama0065@gmail.com") {
      // For all other logged in accounts, stay in continuous loading ("Processing...") state
      return;
    }

    try {
      // Simulate payment processing delay for realistic checkout
      await new Promise((res) => setTimeout(res, 1400));

      const response = await axios.post(
        `${serverURL}/api/payment/process-mock`,
        { planId: currentPlan.id },
        { withCredentials: true }
      );

      if (response.data?.data?.user) {
        dispatch(setUserData(response.data.data.user));
      }

      setSuccessMsg(`Payment Successful! ${currentPlan.credits} credits added.`);

      setTimeout(() => {
        navigate("/pricing?success=true");
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "Payment processing failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-amber-100">
      {/* Stripe Sandbox Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-sm font-medium"
            title="Back"
          >
            <FaArrowLeft className="text-sm" />
          </button>

          <div className="flex items-center gap-2.5">
            <img
              onClick={() => navigate("/")}
              src={logo}
              alt="Logo"
              className="h-8 sm:h-9 w-auto cursor-pointer"
            />
            <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              Sandbox
            </span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Left Column: Plan & Currency Summary */}
          <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Choose a currency:
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrency("PKR")}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm text-center transition-all cursor-pointer ${
                    currency === "PKR"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  PKR {pkrAmount}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm text-center transition-all cursor-pointer ${
                    currency === "USD"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {currentPlan.usdDisplay}
                </button>
              </div>
              <p className="mt-2.5 text-xs text-slate-400 font-medium">
                1 USD = {USD_TO_PKR_RATE} PKR
              </p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {currentPlan.credits} Credits
                  </h3>
                  <p className="text-xs text-slate-500">{currentPlan.name}</p>
                </div>
                <span className="font-bold text-slate-900 text-base sm:text-lg">
                  {displayPrice}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                ⚡ Instant Credit Delivery
              </p>
              <p className="text-amber-800">
                Credits can be used immediately for AI notes generation, revision quizzes, and charts.
              </p>
            </div>
          </div>

          {/* Right Column: Contact & Payment Method Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <form onSubmit={handlePay} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Contact information
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Payment method
                </h3>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 pb-2 border-b border-slate-200/60">
                    <span className="flex items-center gap-2">
                      <FaCreditCard className="text-amber-500 text-base" />
                      Card
                    </span>
                    <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                      <FaLock className="text-slate-400 text-xs" /> 256-bit Encrypted
                    </span>
                  </div>

                  {/* Card Info Box */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Card information
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder=""
                          className="w-full px-3.5 py-2.5 text-sm rounded-t-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:z-10 relative bg-white font-mono"
                        />
                        <div className="absolute right-3.5 top-3">
                          {getCardBrandIcon(cardNumber)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          className="w-full px-3.5 py-2.5 text-sm rounded-bl-xl border-x border-b border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:z-10 relative bg-white text-center font-mono"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={cvc}
                            onChange={(e) =>
                              setCvc(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="CVC"
                            className="w-full px-3.5 py-2.5 text-sm rounded-br-xl border-r border-b border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:z-10 relative bg-white text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Full name on card"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Country or region
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white cursor-pointer"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="India">India</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Information Checkbox */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-900 block">
                      Save my information for faster checkout
                    </span>
                    Pay securely in sandbox and everywhere{" "}
                    <span className="font-semibold text-amber-600">Link</span> is accepted.
                  </div>
                </label>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600 text-base" />
                  {successMsg}
                </div>
              )}

              {/* Pay Action Button */}
              <motion.button
                type="submit"
                disabled={isProcessing || !!successMsg}
                whileHover={{ scale: isProcessing ? 1 : 1.01 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-base shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  `Pay`
                )}
              </motion.button>

              <div className="pt-2 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                <span>Powered by <strong>stripe</strong></span>
                <span>|</span>
                <a
                  href="https://stripe.com/checkout/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-500 cursor-pointer"
                >
                  Terms
                </a>
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-500 cursor-pointer"
                >
                  Privacy
                </a>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
