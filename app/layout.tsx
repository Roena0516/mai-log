import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.ttf",
  variable: "--font-pretendard",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="google-site-verification"
          content="mf7aL1uYp0QgpcvAHQQMmKbLrJiA0lGznuJIKC9d6us"
        />
      </head>
      <body className={pretendard.className}>{children}</body>
    </html>
  );
}
