import ReduxProvider from "@/store/ReduxProvider";
import Navbar from "@/components/layout/navbar";
import "./globals.css";


export const metadata = {
  title: "Content Broadcasting",
  description: "Content Broadcasting System",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReduxProvider>
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
