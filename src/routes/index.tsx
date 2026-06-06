import { createFileRoute } from "@tanstack/react-router";
import { ActivePalsApp } from "@/components/active-pals/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ActivePals AI — Kids Exercise Battles" },
      { name: "description", content: "Gamified AI motion-tracking sports battles for kids in Hong Kong and around the world." },
      { property: "og:title", content: "ActivePals AI" },
      { property: "og:description", content: "Real-time AI exercise battles for kids. Jump, score, win!" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ActivePalsApp />;
}
