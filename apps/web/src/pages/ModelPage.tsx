import { fetchModelInfo } from "@/api";
import { ErrorState, LoadingState, PageHeader, PageShell, Section, Stat } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";

function ModelPage() {
  const info = useAsync(fetchModelInfo, "model-info");

  return (
    <PageShell>
      <PageHeader
        title="The Model"
        description="How SoulCurve predicts a match's win probability, and how well it currently does it."
      />

      {info.error && <ErrorState message={`${info.error}. Refresh to try again.`} />}
      {!info.data && !info.error && <LoadingState label="Loading model info…" />}

      {info.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Version" value={info.data.model_version} />
            <Stat label="Algorithm" value={info.data.algorithm} />
            <Stat label="Trained" value={info.data.trained_at} />
            <Stat label="Training matches" value={info.data.training_matches.toLocaleString()} />
          </div>

          <Section title="How it works" description={`Training patch range: ${info.data.training_patch_range}`}>
            <p className="text-pretty text-sm text-muted-foreground">{info.data.summary}</p>
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Metrics" description="Measured against a held-out set of matches">
              <ul className="flex flex-col divide-y">
                {info.data.metrics.map((metric) => (
                  <li key={metric.label} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <span className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className="font-mono text-lg tabular-nums">{metric.value}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Input Features" description="What the model looks at, at each point in the match">
              <ul className="flex flex-col gap-2">
                {info.data.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-soul" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}
    </PageShell>
  );
}

export default ModelPage;
