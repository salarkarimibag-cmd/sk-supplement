import localFont from "next/font/local";

// The site's fonts live in the repo instead of coming from Google Fonts at
// build time, so the build works on a server that can't reach Google (a host
// inside Iran, say). All are under the SIL Open Font License. To keep them as
// light as Google's copies, each file holds only Google's "latin" and
// "arabic" characters:
// - Vazirmatn-Variable: the `vazirmatn` npm package, v33.0.3
// - GeistMono-Variable: the `geist` npm package, v1.9.0
// - Archivo-BlackItalic: Google's latin file for weight 900 italic (loaded
//   in app/page.tsx, the only page that uses it)

export const vazirmatn = localFont({
  src: "./Vazirmatn-Variable.woff2",
  weight: "100 900",
  variable: "--font-vazirmatn",
});

export const geistMono = localFont({
  src: "./GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
});
