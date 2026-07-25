import { Link } from "react-router-dom";
import Footer from "./Footer";
import logo from "../assets/logo.svg";

function InfoPage({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-3 sm:mx-6 md:mx-auto md:max-w-[85%] xl:max-w-[80%] w-full flex-1 px-4">
        <Link to="/">
          <img src={logo} alt="NoteSprint AI" className="mt-6 h-8 w-auto" />
        </Link>
        <h1 className="mt-10 text-3xl sm:text-4xl font-bold text-slate-900">
          {title}
        </h1>
        <div className="mt-4 flex max-w-2xl flex-col gap-3 text-sm sm:text-base text-slate-600">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default InfoPage;
