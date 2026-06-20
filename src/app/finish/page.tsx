"use client"

import React, { useState, useEffect } from "react";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import "./finish.css";

export default function FinishPage() {

    const [isMdOrLarger, setIsMdOrLarger] = useState(false);

    useEffect(() => {
      const checkScreenSize = () => {
        setIsMdOrLarger(window.innerWidth >= 768);
      };
  
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
  
      return () => window.removeEventListener("resize", checkScreenSize);
    }, []);
  
    return (
      <div className="bg-[#0F172A] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden max-md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] max-sm:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)]">
        <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl z-10 max-md:w-[85vw]">
        <img
              src="/register/exertion.svg"
              alt="Exertion Logo"
              className="h-auto w-30 md:w-40 mb-8"
            />
          <div
            className="md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] backdrop-blur-lg p-6 sm:p-8 lg:p-12 rounded-2xl max-md:rounded-none md:[clip-path:polygon(0%_0%,90%_0%,100%_20%,100%_100%,10%_100%,0%_80%)] max-md:[clip-path:polygon(0%_0%,85%_0%,100%_15%,100%_100%,15%_100%,0%_85%)] border border-white/10 shadow-2xl min-h-[550px] max-md:min-h-[450px] max-md:bg-[#0F172A]"
            style={
              isMdOrLarger
                ? {
                    backgroundImage:
                      "url('/topPolygon.svg'), url('/bottomPolygon.svg'), url('/circuit.svg'), linear-gradient(29.69deg, #1E3A8A 2.47%, #059669 116.12%)",
                    backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
                    backgroundPosition: "top right, bottom left, center, center",
                    backgroundSize: "50% 50%, 30% 30%, contain, cover",
                  }
                : undefined
            }
          >
            <h2 className="orbitron-500 text-2xl max-md:text-3xl text-center sm:text-4xl md:text-4xl lg:text-5xl pt-6 lg:pt-10 pb-5 lg:pb-8 font-bold max-sm:pt-none mb-2 text-white tracking-wider">
              GOOD LUCK!
            </h2>
  
            {/* Robot SVG */}
            <div className="flex justify-center items-center">
              <img
                src="/register/robot.svg"
                alt="Robot"
                className="h-20 w-20 md:h-32 md:w-32"
              />
            </div>
  
            <div className="text-center space-y-2 mt-2 sm:mt-4 lg:mt-2">
              <h3 className="exo-2-400 text-base sm:text-2xl md:text-3xl text-white tracking-wider">
                Your answer has been saved
              </h3>
              
              <p className="exo-2-400 text-base sm:text-2xl md:text-3xl text-white mb-6">
                Please wait for further announcements
              </p>
  
              {/* Center the ButtonRedirect */}
              <div className="flex justify-center pb-6 lg:pb-10 max-sm:pb-none">
                <ButtonRedirect
                    to="/home"
                    className="text-md flex h-11 w-40 md:w-65 items-center justify-center border-2 bg-white font-semibold text-black transition-all hover:bg-gray-300"
                    >
                    <img src="/register/home.svg" alt="Home" className="mr-2 h-6 w-6" />
                    <p className="text-black">Home</p>
                </ButtonRedirect>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}