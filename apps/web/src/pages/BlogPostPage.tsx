import { useParams } from "react-router-dom";
import { fetchBlogPost } from "@/api";
import { ErrorState, LoadingState, PageShell } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";

function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, error } = useAsync(() => fetchBlogPost(slug), `blog-post-${slug}`);

  return (
    <PageShell>
      {error && <ErrorState message={`${error}. Check the link and try again.`} />}
      {!data && !error && <LoadingState label="Loading post…" />}

      {data && (
        <article className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <time dateTime={data.date} className="font-mono tabular-nums">
                {data.date}
              </time>
              <span>{data.author}</span>
            </div>
            <h1 className="display text-2xl leading-tight sm:text-3xl">{data.title}</h1>
          </header>
          <div className="flex flex-col gap-4 text-pretty text-muted-foreground">
            {data.body.split("\n\n").map((paragraph, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      )}
    </PageShell>
  );
}

export default BlogPostPage;
