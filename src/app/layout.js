import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
    title: { default: "Caleb Han", template: "%s | Caleb Han" },
    description: "Developer & Photographer — UNC Chapel Hill '28",
    metadataBase: new URL("https://calebhan.top"),
    openGraph: {
        title: "Caleb Han",
        description: "Developer & Photographer",
        url: "https://calebhan.top",
        siteName: "Caleb Han",
        images: [{ url: "/img/og-image.jpg", width: 1200, height: 630 }],
        type: "website",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="antialiased">
            <Script
                strategy="afterInteractive"
                src="https://www.googletagmanager.com/gtag/js?id=G-SMLM1505P3"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-SMLM1505P3');
                `}
            </Script>
            {children}
            <SpeedInsights />
            <Analytics />
        </body>
        </html>
    );
}
