// Same per-split card for X/Twitter unfurls. Without this file the root
// twitter-image would win for /k/<key> and the card would stay generic.
// Segment config must be declared literally here — Next.js reads it
// statically and won't follow a re-export.
export { default, alt, size, contentType } from "./opengraph-image";
export const revalidate = 300;
