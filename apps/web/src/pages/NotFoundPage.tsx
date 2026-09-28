import { Link } from "react-router-dom";
import { PageHeader, PageShell } from "@/components/site/primitives";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NotFoundPage() {
  return (
    <PageShell>
      <PageHeader title="Page not found" description="This page doesn't exist or has moved." />
      <Link to="/" className={cn(buttonVariants(), "w-fit")}>
        Back to Home
      </Link>
    </PageShell>
  );
}

export default NotFoundPage;
