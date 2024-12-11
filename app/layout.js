import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Fit Share",
  description: "FitShare is a dynamic platform where users can share their outfits, discover fashion inspiration, and connect with a vibrant community of style enthusiasts. With features like creating posts, liking/unliking, and following/unfollowing other users, FitShare offers a seamless way to engage with fashion trends and showcase your unique style.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
