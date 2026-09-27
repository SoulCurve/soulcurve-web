import { PageHeader, PageShell } from "@/components/site/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is SoulCurve?",
    answer:
      "SoulCurve is a stats and coaching companion for Deadlock. It shows how a match’s " +
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
      "objective) is valued by how much it changed your team’s win probability. The " +
      "score starts at 10 and is reduced by the moments that hurt your win probability " +
      "— good plays are shown for context but don’t add points back.",
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
    <PageShell>
      <PageHeader eyebrow="FAQ" title="Questions & Answers" />
      <Accordion className="max-w-3xl gap-2" defaultValue={[FAQ_ITEMS[0].question]}>
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="rounded-lg border bg-card transition-colors not-last:border-b data-open:border-soul/30"
          >
            <AccordionTrigger className="px-5 py-4 text-[15px] hover:no-underline">{item.question}</AccordionTrigger>
            <AccordionContent className="px-5 text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageShell>
  );
}

export default FaqPage;
