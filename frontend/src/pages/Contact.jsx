import InfoPage from "../components/InfoPage";

function Contact() {
  return (
    <InfoPage title="Contact Us">
      <p>Questions, feedback or issues? We would love to hear from you.</p>
      <p>
        Email us at{" "}
        <a
          href="mailto:support@notesprint.ai"
          className="font-semibold text-amber-600 hover:underline"
        >
          support@notesprint.ai
        </a>{" "}
        and we will get back to you within 1-2 business days.
      </p>
    </InfoPage>
  );
}

export default Contact;
