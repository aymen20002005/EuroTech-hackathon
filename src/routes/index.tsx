import { createFileRoute } from "@tanstack/react-router";
import { ActivePalsApp } from "@/components/active-pals/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZaoWay — Your Daily Movement Game" },
      { name: "description", content: "Casual movement games for real life. Play, earn diamonds, build your personal space. No gym needed." },
      { property: "og:title", content: "ZaoWay" },
      { property: "og:description", content: "Roll out of bed. Start playing. ZaoWay — movement games for young adults." },
    ],
  }),
  component: Index,
});

function Index() {
  return <ActivePalsApp />;
}
