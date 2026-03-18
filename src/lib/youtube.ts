export function extractYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      return isValidYoutubeId(id) ? id : null;
    }

    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return isValidYoutubeId(id) ? id : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.replace("/embed/", "").split("/")[0];
        return isValidYoutubeId(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

function isValidYoutubeId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{11}$/.test(value);
}
