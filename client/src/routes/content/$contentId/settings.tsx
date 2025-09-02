import { getContentById } from "@/api/content";
import { getMediaByContentId } from "@/api/media";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/content/$contentId/settings")({
  loader: async ({ params }) => {
    const [contentData, mediaData] = await Promise.all([
      getContentById(params.contentId),
      getMediaByContentId(params.contentId),
    ]);

    return {
      content: contentData,
      media: mediaData,
    };
  },

  component: SettingsComponent,
});

function SettingsComponent() {
  return <div>Hello "/content/$contentId/settings"!</div>;
}
