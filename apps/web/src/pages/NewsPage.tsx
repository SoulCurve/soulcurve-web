import { useEffect, useState } from "react";
import { fetchNews } from "../api";
import type { NewsResponse } from "../api";

const TAG_LABELS: Record<string, string> = {
  "patch-notes": "Patch notes",
  news: "News",
};

function NewsPage() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNews()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <div className="page-head">
        <span className="eyebrow">News</span>
        <h1>Patch notes &amp; updates</h1>
      </div>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p className="state-text">Loading news…</p>}

      {data && (
        <ul className="news-list">
          {data.items.map((item) => (
            <li key={item.id} className="panel news-card">
              <div className="news-card-meta">
                <span className={item.tag === "patch-notes" ? "chip" : "chip chip-muted"}>{TAG_LABELS[item.tag]}</span>
                <time dateTime={item.date}>{item.date}</time>
              </div>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default NewsPage;
