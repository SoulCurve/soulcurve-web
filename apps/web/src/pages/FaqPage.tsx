const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is SoulCurve?",
    answer:
      "SoulCurve is a stats and coaching companion for Deadlock. It shows how a match's " +
      "win probability shifted over time, general hero/item win-rate stats, and a " +
      "per-match mistake score that points out where you lost ground.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Match data comes from the community-run deadlock-api.com data lake. The win " +
      "probability and mistake-score models are currently mock data while the " +
      "underlying prediction model is being built and validated.",
  },
  {
    question: "How is the mistake score calculated?",
    answer:
      "Each notable moment in your match (a death, a missed rotation, a good trade, an " +
      "objective) is valued by how much it changed your team's win probability. The " +
      "score starts at 10 and is reduced by the moments that hurt your win probability " +
      "— good plays are shown for context but don't add points back.",
  },
  {
    question: "Is SoulCurve free?",
    answer:
      "Yes, for now. A low-cost subscription for extra features is planned once the " +
      "model is validated, but the core stats and match analysis stay usable without " +
      "an account.",
  },
];

function FaqPage() {
  return (
    <main>
      <h1>FAQ</h1>
      <ul className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <li key={item.question}>
            <details>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default FaqPage;
