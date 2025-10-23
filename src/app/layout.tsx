import type { Metadata } from "next";
import BackgroundLayout from "@/shared/components/BackgroundLayout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Truth Or Dare!",
  description: "truth or daree",
  openGraph: {
    images: `https://mother-calc.netlify.app/images/metaImg.png`,
  },
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BackgroundLayout>{children}</BackgroundLayout>;
}
