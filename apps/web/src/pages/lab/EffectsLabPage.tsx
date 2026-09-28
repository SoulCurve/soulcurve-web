import { PageHeader, PageShell, Section, Stat } from "@/components/site/primitives";
import BlobTrackingDemo from "@/components/lab/BlobTrackingDemo";
import DataMoshDemo from "@/components/lab/DataMoshDemo";
import OneBitDitherDemo from "@/components/lab/OneBitDitherDemo";

// Hidden route (not linked from SiteHeader): a side-by-side comparison of
// visual-effect experiments against the site's own premium/minimal bar, so
// each one can be judged before it ever touches a real page.
function EffectsLabPage() {
  return (
    <PageShell>
      <PageHeader
        title="Effects Lab"
        description="Unlisted comparison page. None of these run on real pages yet — judge each against the Statlocker/Leetify-level bar before it goes anywhere near one."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Blob tracking"
          description="SVG goo filter, metaball blobs that chase the pointer"
        >
          <BlobTrackingDemo />
          <p className="mt-3 text-xs text-muted-foreground">
            Move the pointer inside the frame. Reads as playful/organic — likely too soft for a
            data-dense analytics surface, but could work as a loading state or an empty-state
            illustration.
          </p>
        </Section>

        <Section
          title="Data-mosh"
          description="Block-smear glitch: shifted pixel bands blended over the previous frame"
        >
          <DataMoshDemo />
          <p className="mt-3 text-xs text-muted-foreground">
            Ambient corruption every few seconds. On-brand with the &quot;broken feed&quot;
            aesthetic, but a constant glitch fights legibility if it ever sits behind real charts.
          </p>
        </Section>

        <Section
          title="1-bit ordered dither"
          description="Bayer-matrix halftone gradient that follows the pointer"
          className="lg:col-span-2"
        >
          <OneBitDitherDemo />
          <p className="mt-3 text-xs text-muted-foreground">
            Move the pointer inside the frame. Closest fit to the site&apos;s hairline/monospace
            language — could work as a subtle backdrop texture at very low opacity, the way the
            blueprint grid is used today.
          </p>
        </Section>

        <Section
          title="In context: dither as a backdrop"
          description="Same effect at 10% opacity, coarser cells, behind real stat tiles"
          className="lg:col-span-2"
        >
          <div className="relative overflow-hidden rounded-md border">
            <div className="absolute inset-0 opacity-10">
              <OneBitDitherDemo cell={6} className="h-full" />
            </div>
            <div className="relative grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
              <Stat label="Win rate" value="54.2%" />
              <Stat label="KDA" value="3.41" />
              <Stat label="Souls / min" value="1,284" />
              <Stat label="Mistake score" value="7.8/10" />
            </div>
          </div>
        </Section>
      </div>
    </PageShell>
  );
}

export default EffectsLabPage;
