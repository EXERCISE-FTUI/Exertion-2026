import Link from "next/link";

export default function FinishPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#49769F] via-[#7BBDE8] to-[#BDD8E9] p-4">
      <div
        className="relative flex w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#001D39] to-[#0A4174] px-4 py-6 shadow-2xl sm:px-8 sm:py-12"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - clamp(24px, 8vw, 60px)) 0, 100% clamp(24px, 8vw, 60px), 100% 100%, clamp(24px, 8vw, 60px) 100%, 0 calc(100% - clamp(24px, 8vw, 60px)))",
        }}
      >
        <img
          src="/exermind3hexagon.svg"
          className="absolute -top-2 left-2 h-12 w-12 object-contain opacity-90 brightness-110 max-[280px]:h-8 max-[280px]:w-8 sm:-top-4 sm:left-16 sm:h-24 sm:w-24"
        />
        <img
          src="/exermind_left_big_hexagon.svg"
          className="absolute -left-8 top-8 h-20 w-20 object-contain opacity-90 brightness-110 max-[280px]:h-14 max-[280px]:w-14 sm:-left-12 sm:top-10 sm:h-44 sm:w-44"
        />
        <img
          src="/exermind_left_triangle.svg"
          className="absolute -left-3 top-1/2 h-8 w-8 object-contain opacity-90 brightness-110 max-[280px]:h-6 max-[280px]:w-6 sm:-left-5 sm:h-20 sm:w-20"
        />
        <img
          src="/exermind_left_inner_hexagon.svg"
          className="absolute bottom-6 left-4 h-16 w-16 object-contain opacity-90 brightness-110 max-[280px]:bottom-8 max-[280px]:h-12 max-[280px]:w-12 sm:bottom-12 sm:left-16 sm:h-32 sm:w-32"
        />

        <img
          src="/exermind_right_3hexagon.svg"
          className="absolute bottom-12 right-4 h-14 w-14 object-contain opacity-90 brightness-110 max-[280px]:h-10 max-[280px]:w-10 sm:bottom-16 sm:right-20 sm:h-28 sm:w-28"
        />
        <img
          src="/exermind_right_inner_hexagon.svg"
          className="absolute -right-12 top-6 h-24 w-24 object-contain opacity-90 brightness-110 max-[280px]:h-16 max-[280px]:w-16 sm:-right-20 sm:top-8 sm:h-60 sm:w-60"
        />

        <img
          src="/exermind_bottom_circuit_line.svg"
          className="absolute bottom-1 left-0 h-4 w-full object-cover opacity-90 brightness-110 sm:bottom-3 sm:h-10"
        />

        <div className="relative z-10 flex w-full flex-col items-center text-center">
          <h1 className="font-orbitron text-xl font-black tracking-widest text-white max-[280px]:text-lg sm:text-3xl md:text-4xl">
            GOOD LUCK!
          </h1>

          <img
            src="/exermind_maskot.svg"
            className="mb-4 mt-4 h-28 w-28 object-contain max-[280px]:mb-3 max-[280px]:mt-3 max-[280px]:h-20 max-[280px]:w-20 sm:mb-6 sm:mt-6 sm:h-44 sm:w-44"
          />

          <p className="text-xs font-medium text-white max-[280px]:text-[10px] sm:text-base md:text-lg">
            Your answer has been saved
          </p>
          <p className="mt-1 text-[11px] font-light text-[#BDD8E9] max-[280px]:text-[8px] sm:mt-2 sm:text-sm md:text-base">
            Please wait for further announcements
          </p>

          <Link
            href="/home"
            className="mt-6 whitespace-nowrap rounded-full bg-white px-7 py-2 text-xs font-bold text-[#001D39] transition-colors hover:bg-[#BDD8E9] max-[280px]:mt-4 max-[280px]:px-4 max-[280px]:py-1.5 max-[280px]:text-[9px] sm:mt-8 sm:px-9 sm:py-2.5 sm:text-base cursor-pointer"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </main>
  );
}
