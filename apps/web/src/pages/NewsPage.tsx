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
      <h1>News</h1>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p>Loading...</p>}

      {data && (
        <ul className="news-list">
          {data.items.map((item) => (
            <li key={item.id} className="news-card">
              <div className="news-card-meta">
                <span className={`news-tag news-tag-${item.tag}`}>{TAG_LABELS[item.tag]}</span>
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
