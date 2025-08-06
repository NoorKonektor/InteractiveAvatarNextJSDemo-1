import "@/styles/globals.css";
import { Metadata } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Virtual Meeting Assistant",
    template: `%s - Virtual Meeting Assistant`,
  },
  description: "AI-powered virtual meeting assistant with multilingual support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Permissions-Policy" content="microphone=*, camera=*, display-capture=*" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <main className="relative flex flex-col gap-6 h-screen w-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
