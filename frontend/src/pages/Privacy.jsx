import InfoPage from "../components/InfoPage";

function Privacy() {
  return (
    <InfoPage title="Privacy Policy">
      <p>
        At NoteSprint AI, your privacy is our top priority. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services.
      </p>
      <h3 className="text-lg font-bold text-slate-800 mt-4">1. Information We Collect</h3>
      <p>
        We collect basic information required to provide our service, including your name, email address (via Google Authentication), and generated study notes and quizzes.
      </p>
      <h3 className="text-lg font-bold text-slate-800 mt-4">2. How We Use Information</h3>
      <p>
        Your data is used solely to authenticate your account, maintain your credit balances, and store your study note history. We do not sell or share your personal data with third parties.
      </p>
      <h3 className="text-lg font-bold text-slate-800 mt-4">3. Data Security</h3>
      <p>
        We use industry-standard encryption protocols and secure database connections to keep your account and generated content safe.
      </p>
      <h3 className="text-lg font-bold text-slate-800 mt-4">4. Contact Us</h3>
      <p>
        If you have any questions regarding this Privacy Policy, please contact us at bilalsolution10@gmail.com.
      </p>
    </InfoPage>
  );
}

export default Privacy;
