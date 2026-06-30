"use client";

import { Mail as MailIcon, MapPin as MapPinIcon } from "lucide-react";
import { Exo_2, Inter, Orbitron } from "next/font/google";
import { SiInstagram, SiLinkedin } from "react-icons/si";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });


const Footer = () => {
  return (
    <footer className="relative h-auto w-full max-w-[2200px] text-white"
      style={{
        backgroundImage: `url('/footer/Footer.svg'),url('/footer/frame.svg')`,
        backgroundSize: '100% 100%, 100% 100%',
        backgroundPosition: 'bottom, bottom',
        backgroundRepeat: 'no-repeat'
      }}>
      
      

      <div className="items-cente relative z-10 grid grid-cols-1 justify-center px-[11%] md:px-[5%] pt-[20%] pb-[3.5%] gap-[8vw] md:grid-cols-2 md:pt-[7%]">
        <div className="flex flex-col justify-center items-start gap-[2vw] md:gap-[1vw] h-full">
          <img
            className="h-auto w-[50vw] md:w-[18rem] lg:w-[22rem] object-contain mb-[4vw] md:mb-0"
            src="/footer/Exertion Logo Dark.svg"
            alt="Exertion Logo"
          />
          {/* reserved rights */}
          <div className="hidden pb-[2vw] pl-[5vw] text-[min(2vw,110%)] md:block lg:pb-0">
            © 2026 Exercise FTUI
          </div>
        </div>

        {/* alamat */}

        <div className="z-20 flex flex-col justify-center gap-0 pr-[4vw] pl-[3vw] sm:gap-[1.8vw] md:gap-[1vw]">
          <a
            href="https://www.google.com/maps/place/Faculty+of+Engineering+Universitas+Indonesia/@-6.3615601,106.8239092,16z/data=!3m1!4b1!4m6!3m5!1s0x2e69ec192c30aa47:0x72f29bad0571e98c!8m2!3d-6.3615601!4d106.8239092!16s%2Fg%2F11bcf56bzc?entry=ttu&g_ep=EgoyMDI1MDYyMy4yIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center gap-[2vw]"
          >
            <MapPinIcon className="h-auto w-[min(7.5vw,3.75rem)] group-hover:text-[#d6fcff] md:w-[2.8rem]" />
            <span className="text-[2.5vw] leading-snug font-normal text-[#FAFAFA] group-hover:text-[#d6fcff] md:text-[min(2vw,110%)]">
              Faculty of Engineering, University of Indonesia, Jl. Prof. DR. Ir
              R Roosseno, Kukusan, Beji, Depok City, West Java 16425
            </span>
          </a>

          <div className="w-full items-center">
            <a
              href="mailto:exertionui@gmail.com"
              className="group inline-flex items-center gap-[2vw] text-[2.6vw] leading-snug font-normal text-[#FAFAFA] md:text-[min(2vw,110%)]"
            >
              <MailIcon className="h-auto w-[3.5vw] group-hover:text-[#d6fcff] md:w-[2rem]" />
              <p className="w-auto text-[2.6vw] leading-snug font-normal text-[#FAFAFA] group-hover:text-[#d6fcff] md:text-[min(2vw,110%)]">
                exertionui@gmail.com
              </p>
            </a>
          </div>

          <a
            href="https://www.instagram.com/exertion.ui"
            className="group z-0 inline-flex items-center gap-[2vw] text-[2.6vw] leading-snug font-normal text-[#FAFAFA] md:text-[min(2vw,110%)]"
          >
            <SiInstagram className="h-auto w-[3.5vw] group-hover:text-[#d6fcff] md:w-[2rem]" />
            <p className="text-[2.6vw] leading-snug font-normal text-[#FAFAFA] group-hover:text-[#d6fcff] md:text-[min(2vw,110%)]">
              @exertion.ui
            </p>
          </a>

          <a
            href="https://www.linkedin.com/company/exercise-ftui/"
            target="_blank"
            rel="noopener noreferrer"
            className="group z-0 inline-flex items-center gap-[2vw] text-[2.6vw] leading-snug font-normal text-[#FAFAFA] md:text-[min(2vw,110%)]"
          >
            <SiLinkedin className="h-auto w-[3.5vw] group-hover:text-[#d6fcff] md:w-[2rem]" />
            <p className="text-[2.6vw] leading-snug font-normal text-[#FAFAFA] group-hover:text-[#d6fcff] md:text-[min(2vw,110%)]">
              EXERCISE FTUI
            </p>
          </a>

          <div className="flex w-full items-center gap-[2vw]"></div>
        </div>

        <div className="flex flex-col items-center pt-[2vw] md:hidden">
          {/* reserved rights */}
          <div className="pb-[2vw] pl-[5vw] text-[2.6vw] lg:pb-0">
            © 2026 Exercise FTUI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
