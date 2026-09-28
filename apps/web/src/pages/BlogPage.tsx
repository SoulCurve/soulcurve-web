import { Link } from "react-router-dom";
import { fetchBlogList } from "@/api";
import { ErrorState, LoadingState, PageHeader, PageShell } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";

function BlogPage() {
  const list = useAsync(fetchBlogList, "blog-list");

  return (
    <PageShell>
      <PageHeader title="Blog" description="Notes on how SoulCurve works, read guides, and what's coming next." />

      {list.error && <ErrorState message={`${list.error}. Refresh to try again.`} />}
      {!list.data && !list.error && <LoadingState label="Loading posts…" variant="list" />}

      {list.data && (
        <ol className="flex flex-col divide-y border-y">
          {list.data.posts.map((post) => (
            <li key={post.slug} className="py-6">
              <Link to={`/blog/${post.slug}`} className="group flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <time dateTime={post.date} className="font-mono text-sm text-muted-foreground tabular-nums">
                    {post.date}
                  </time>
                  <span className="text-sm text-muted-foreground">{post.author}</span>
                </div>
                <h2 className="text-lg font-medium text-balance group-hover:text-soul">{post.title}</h2>
                <p className="text-sm text-pretty text-muted-foreground">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </PageShell>
  );
}

export default BlogPage;
