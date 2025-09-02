export function convertToEmbedUrl(youtubeUrl: string): string | null {
  try {
    let videoId: string = "";

    // Handle different YouTube URL formats
    if (youtubeUrl.includes("youtube.com/watch?v=")) {
      const url = new URL(youtubeUrl);
      videoId = url.searchParams.get("v") || "";
    } else if (youtubeUrl.includes("youtu.be/")) {
      // Handle shortened youtu.be links
      const url = new URL(youtubeUrl);
      videoId = url.pathname.substring(1); // Remove the leading slash
    } else {
      throw new Error("Invalid YouTube URL format");
    }

    if (!videoId) {
      throw new Error("No video ID found in URL");
    }

    // Clean video ID (remove any additional parameters that might be attached)
    videoId = videoId.split("&")[0];
    videoId = videoId.split("?")[0];

    // Build the embed URL with specified parameters
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
  } catch (error) {
    console.error(
      "Error converting YouTube URL:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}
