import PowerUpComponent from "../exermind/_components/powerup";
import Link from "next/link";

const PowerUpPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-linear-to-t from-[#0B8071] from-[-10%] via-[#38405F] via-40% to-[#111417] to-[120%] p-10">
      <div>
        <img src="/home/header/logo_exertion.svg" alt="" className="h-12" />
      </div>

      <PowerUpComponent />

      {/* Button */}
      <div className="z-10 mx-10 mb-5 flex justify-end">
        <Link
          className="rounded-sm bg-blackish-green px-12 py-2 font-orbitron font-bold text-white"
          href="#nextpage"
        >
          Next
        </Link>
      </div>

      {/* Background */}
      <div>
        <svg
          className="absolute top-0 right-0 w-64 translate-x-1/4 -translate-y-1/4 stroke-1"
          viewBox="0 0 251 226"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M249.531 104.164L208.606 215.888L84.6217 224.906L1.60555 122.084L42.5303 10.3602L166.514 1.34167L249.531 104.164Z"
            stroke="#FFE2E4"
          />
          <path
            d="M224.576 110.249L194.231 193.09L95.3282 196.693L26.8493 117.24L57.1945 34.3985L156.097 30.7954L224.576 110.249Z"
            stroke="#FFE2E4"
          />
        </svg>

        <svg
          className="absolute top-1/2 left-0 h-32 stroke-1"
          viewBox="0 0 104 166"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M102.838 81.0854L70.6107 157.932L-22.3683 164.696L-80.8017 100.969L-50.1337 17.2461L42.8165 10.4837L102.838 81.0854Z"
            stroke="#FFE2E4"
          />
          <path
            d="M72.3484 70.7147L45.8313 143.106L-40.5916 146.254L-100.429 76.8267L-73.9121 4.43581L12.5099 1.28743L72.3484 70.7147Z"
            stroke="#FFE2E4"
          />
        </svg>

        <svg
          className="absolute top-1/2 right-1/4 hidden w-32 translate-x-1/2 -translate-y-1/2 stroke-1 md:block"
          viewBox="0 0 164 129"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M142.707 59.1277L119.386 122.793L48.7347 127.932L1.42933 69.3398L24.75 5.67484L95.4005 0.535125L142.707 59.1277Z"
            stroke="#FFE2E4"
          />
          <path
            d="M163.348 62.8958L146.056 110.103L89.6971 112.156L50.6752 66.8805L67.9673 19.6735L124.326 17.6201L163.348 62.8958Z"
            stroke="#FFE2E4"
          />
        </svg>

        <svg
          className="absolute top-1/3 left-1/6 hidden w-32 -translate-x-1/2 -translate-y-1/2 stroke-1 md:block"
          viewBox="0 0 151 147"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M150.116 76.8191L126.795 140.484L56.1438 145.623L8.83842 87.0312L32.1591 23.3662L102.81 18.2265L150.116 76.8191Z"
            stroke="#FFE2E4"
          />
          <path
            d="M113.348 45.8958L96.0557 93.1028L39.697 95.1561L0.675144 49.8805L17.9672 2.67348L74.3258 0.620137L113.348 45.8958Z"
            stroke="#FFE2E4"
          />
        </svg>
      </div>
    </div>
  );
};

export default PowerUpPage;
