import { curveMonotoneX } from "@visx/curve";
import { fetchWinProbability } from "@/api";
import { Area, AreaChart, ChartTooltip, Grid, XAxis } from "@/components/charts";
import { ErrorState, LoadingState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";

const SAMPLE_MATCH = "31415926";

// bklit's time-series charts only accept a Date x-axis, so match minutes are
// encoded as offsets from the epoch.
const minuteToDate = (tMin: number) => new Date(tMin * 60_000);

function ChartsLabPage() {
  const wp = useAsync(() => fetchWinProbability(SAMPLE_MATCH), `lab-wp-${SAMPLE_MATCH}`);

  return (
    <PageShell>
      <PageHeader
        title="Charts Lab"
        description="Unlisted: the match win-probability chart rebuilt with bklit.ui, to compare against the Recharts version on the match page."
      />

      {wp.error && <ErrorState message={`${wp.error}. Refresh to try again.`} />}
      {!wp.data && !wp.error && <LoadingState label="Loading chart…" />}

      {wp.data && (
        <Section title="Win Probability · bklit.ui" description="AreaChart + Grid + XAxis + ChartTooltip">
          <AreaChart
            data={wp.data.points.map((p) => ({ date: minuteToDate(p.t_min), p_win: Math.round(p.p_win * 100) }))}
            aspectRatio="3 / 1"
            animationDuration={900}
          >
            <Grid horizontal />
            <Area dataKey="p_win" curve={curveMonotoneX} strokeWidth={2} fillOpacity={0.25} />
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        </Section>
      )}
    </PageShell>
  );
}

export default ChartsLabPage;
