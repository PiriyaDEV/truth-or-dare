"use client";

import { FC } from "react";
import { Sarabun } from "next/font/google";
import type { Metadata } from "next";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

const sarabun = Sarabun({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "เกมวงเหล้า!",
  description: "ไม่เมาไม่เลิกจ้า",
  // openGraph: {
  //   images: `https://mother-calc.netlify.app/images/metaImg.png`,
  // },
};

const BackgroundLayout: FC<BackgroundLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={`${sarabun.variable}`}>
      <body className="antialiased">
        <div className="bg-cover bg-center flex flex-col items-center sm:bg-gray-100 min-h-screen">
          <div className="fixed w-full sm:max-w-[450px] top-0 bg-white z-[98] text-center font-bold py-4 mb-2 text-[22px] text-[#DE3163] border-[1px]">
            เกมวงเหล้า!
            <div className="text-xs mb-2 text-black">Version: 1.0.0</div>
            <div className="text-xs text-center text-[#c5c6c7]">
              Made by{" "}
              <span
                className="!text-[#FFC107] underline cursor-pointer"
                onClick={() => {
                  window.open(
                    "https://www.instagram.com/pd.piriya/#",
                    "_blank"
                  );
                }}
              >
                @pd.piriya
              </span>{" "}
              🤪✨
            </div>
          </div>
          <div className="container sm:max-w-[450px] mx-auto sm:mx-0 px-4 flex-grow bg-white">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
};

export default BackgroundLayout;
