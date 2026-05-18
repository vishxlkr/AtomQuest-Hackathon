import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";

export const metadata = { title: "Employee Portal" };

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1c1c28",
                color: "#f1f5f9",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "500",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#16161f" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#16161f" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
