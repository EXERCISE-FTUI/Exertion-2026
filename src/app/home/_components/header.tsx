"use client";

import { Menu } from "lucide-react";
import { Exo_2, Inter, Orbitron } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });

interface HeaderProps {
  isSigned: boolean;
  onSignOut: () => void;
  displayName: string | null;
}

const Header = ({ isSigned, onSignOut, displayName }: HeaderProps) => {
  const [visible, setVisible] = useState(true);
  const [menu, setMenu] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleRedirectSign = () => {
    if (isSigned) onSignOut();
    else router.push("/sign-in");
  };

  const handleMenu = () => {
    setMenu(!menu);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      setMenu(false);
    }, 3000);
  };

  useEffect(() => {
    let prevScroll = window.pageYOffset;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const isScrollingUp = currentScroll < prevScroll;

      if (Math.abs(currentScroll - prevScroll) > 10) {
        setVisible(isScrollingUp);
      }

      prevScroll = currentScroll;

      if (timeoutId.current) clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(() => {
        setVisible(true);
      }, 3000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 flex h-[160px] w-full max-w-[2200px] items-center justify-between px-4 md:justify-around ${orbitron.className} z-50 ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-full pointer-events-none"} transition-all duration-300 ease-in-out bg-top bg-no-repeat`}
      style={{
        backgroundImage: `url('/home/header/Header2.svg'),url('/home/header/Frame1.svg')`,
        backgroundSize: '100% 77.64%, 100% 100%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Link href="#home">
        <Image
          src="/home/header/Exertion Logo Dark.svg"
          alt="logo-exertion"
          width={188}
          height={200}
          className="h-20 w-auto md:h-14"
        />
      </Link>
      <div className="hidden h-top w-[45%] items-center justify-between mt-[-50px] rounded-2xl border border-white bg-white/1 backdrop-blur-sm px-8 py-3 text-white md:flex">
        <Link
          href="#home"
          className="px-2 transition-all duration-300 hover:font-bold hover:underline whitespace-nowrap"
        >
          HOME
        </Link>
        <Link
          href="#competitions"
          className="transition-all duration-300 hover:font-bold hover:underline"
        >
          COMPETITION
        </Link>
        <Link
          href="#timeline"
          className="transition-all duration-300 hover:font-bold hover:underline"
        >
          TIMELINE
        </Link>
        <Link
          href="/dashboard"
          className="transition-all duration-300 hover:font-bold hover:underline"
        >
          DASHBOARD
        </Link>
      </div>
      <div className="hidden items-center gap-4 mt-[-50px] md:flex">
        {isSigned && displayName ? (
          <Link href="/dashboard">
            <h1 className="cursor-pointer text-lg font-semibold whitespace-nowrap text-white transition-all duration-300 hover:underline">
              {displayName}
            </h1>
          </Link>
        ) : null}

        <button
          onClick={handleRedirectSign}
          className="flex w-fit cursor-pointer items-center justify-center rounded-2xl bg-white px-3 py-1 text-center text-[#1C465C] transition-all duration-300 hover:scale-105 hover:font-bold"
        >
          {isSigned ? "SIGN OUT" : "SIGN IN"}
        </button>
      </div>
      <div onClick={handleMenu} className="cursor-pointer md:hidden">
        <Menu size={36} color="white" />
        {menu && (
          <div className="absolute top-[10vh] right-4 z-[100] flex w-40 flex-col items-center justify-center rounded-lg bg-[#111417] p-2 text-sm text-white">
            <Link
              href="#home"
              className="w-full py-2 text-center transition-colors duration-200"
            >
              HOME
            </Link>
            <Link
              href="#competitions"
              className="w-full py-2 text-center transition-colors duration-200"
            >
              COMPETITION
            </Link>
            <Link
              href="#timeline"
              className="w-full py-2 text-center transition-colors duration-200"
            >
              TIMELINE
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2 text-center transition-colors duration-200"
            >
              DASHBOARD
            </Link>
            {isSigned && displayName ? (
              <Link href="/dashboard">
                <h1 className="cursor-pointer py-2 text-center text-lg font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:underline">
                  {displayName}
                </h1>
              </Link>
            ) : null}
            <button
              onClick={handleRedirectSign}
              className="mt-2 w-full rounded-2xl bg-white px-3 py-1 text-center text-[#1C465C] transition-all duration-300 hover:scale-105 hover:font-bold"
            >
              {isSigned ? "SIGN OUT" : "SIGN IN"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
