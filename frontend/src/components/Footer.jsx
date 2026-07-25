import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function Footer() {
  const navigate = useNavigate()
  return (
    <motion.footer
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16 border-t border-slate-200 bg-slate-100/70"
    >
      <div className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-6">
        <img onClick={()=>navigate("/")} src={logo} alt="NoteSprint AI" className="h-7 w-auto cursor-pointer" />
        <p className="text-xs font-medium text-slate-500">
          © 2026 NoteSprint AI. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <Link to="/about" className="hover:text-amber-600">
            About
          </Link>
          <Link to="/contact" className="hover:text-amber-600">
            Contact
          </Link>
          <Link to="/terms" className="hover:text-amber-600">
            Terms
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
