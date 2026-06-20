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
      className={`fixed top-0 flex h-[10vh] w-full max-w-[2200px] items-center justify-between bg-[#111417] px-4 md:justify-around md:bg-[#111417]/45 ${orbitron.className} z-50 ${visible ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ease-in-out`}
    >
      <Link href="#home">
        <Image
          src="/home/header/logo_exertion.svg"
          alt="logo-exertion"
          width={188}
          height={57}
          className="h-10 w-auto md:h-14"
        />
      </Link>
      <div className="hidden h-fit w-1/3 items-center justify-around rounded-full border border-white bg-[#434343] px-2 py-1 text-white md:flex">
        <Link
          href="#home"
          className="transition-all duration-300 hover:font-bold hover:underline"
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
      </div>
      <div className="hidden items-center gap-4 md:flex">
        {isSigned && displayName ? (
          <h1 className="text-lg font-semibold whitespace-nowrap text-white">
            {displayName}
          </h1>
        ) : null}

        <button
          onClick={handleRedirectSign}
          className="flex w-fit cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1 text-center text-[#1C465C] transition-all duration-300 hover:scale-105 hover:font-bold"
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
            {isSigned && displayName ? (
              <h1 className="text-lg font-semibold whitespace-nowrap text-white">
                {displayName}
              </h1>
            ) : null}
            <button
              onClick={handleRedirectSign}
              className="mt-2 w-full rounded-full bg-white px-3 py-1 text-center text-[#1C465C] transition-all duration-300 hover:scale-105 hover:font-bold"
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
