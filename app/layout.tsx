import "./globals.css";

export const metadata = {
  title: "YORYANTRA",
  description:
    "Smart utilities for structured workflows, productivity, and modern work.",
  icons: {
    icon: "/YoryantraFavicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}