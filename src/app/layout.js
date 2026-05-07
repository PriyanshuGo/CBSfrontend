import ReduxProvider from "@/store/ReduxProvider";
import "./globals.css";


export const metadata = {
  title: "Content Broadcasting",
  description: "Content Broadcasting System",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
