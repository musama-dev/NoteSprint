import InfoPage from "../components/InfoPage";

function Terms() {
  return (
    <InfoPage title="Terms of Service">
      <p>
        By using NoteSprint AI you agree to use the service for personal study
        and educational purposes only.
      </p>
      <p>
        Credits are consumed per generation and are non-refundable once used.
        Purchased credits do not expire. AI-generated content may contain
        mistakes — always verify important facts before your exam.
      </p>
      <p>
        We store only the data needed to run your account: your name, email
        and generated notes. We never sell your data.
      </p>
    </InfoPage>
  );
}

export default Terms;
