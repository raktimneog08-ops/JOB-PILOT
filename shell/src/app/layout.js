import "./globals.css";

export const metadata = {
  title: "Combine UI | Unified Integration Shell",
  description: "A single cohesive web UI integrating JD-Resume, Resume Shapeshifter, and The Closer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
