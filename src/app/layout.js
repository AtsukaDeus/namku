import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import Providers from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Namku",
    description: "Chat para gestión y recepción de observaciones en prevención de riegos",
};

export default function RootLayout({ children }) {
return (
    <html lang="es" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
        <Providers>
            <LayoutWrapper>
            {children}
            </LayoutWrapper>
        </Providers>
        </ThemeProvider>
    </body>
    </html>
);
}
