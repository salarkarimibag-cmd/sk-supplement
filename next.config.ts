import type { NextConfig } from "next";

// Sent with every response. Strict-Transport-Security isn't here because
// Vercel already adds it (max-age of two years) for the custom domain.
const securityHeaders = [
  // Nobody may show the site inside an <iframe> on their own page, where
  // invisible buttons could be laid over it to trick shoppers into clicks
  // ("clickjacking"). X-Frame-Options covers older browsers;
  // frame-ancestors is the modern equivalent.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Browsers must trust the declared Content-Type instead of guessing, so a
  // file can't be "sniffed" into running as a script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only the origin we came from, never the full URL with
  // its query string. (The reset-password page sets a stricter policy.)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The shop never uses these, so no script on it (a compromised
  // dependency, say) can ask for them either.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise "X-Powered-By: Next.js": it tells attackers which
  // framework (and so which known bugs) to try, and helps nobody else.
  poweredByHeader: false,
  images: {
    // <Image> serves AVIF to browsers that accept it (usually 20–30% smaller
    // than WebP at the same quality) and WebP to the rest; the order matters,
    // the first format the browser accepts wins.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
