const Background = () => {
  return (
    <div>
      {/* Hexagon */}
      <svg
        className="absolute right-0 bottom-1/2 -z-20 w-xs translate-x-1/2 translate-y-3/4 -rotate-45 stroke-brilliant-blue stroke-1 sm:bottom-0 sm:translate-x-1/4 sm:translate-y-1/4"
        viewBox="0 0 232 263"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M208.801 75.3889V188.097L114.234 244.436L19.6674 188.097V75.3889L114.234 19.05L208.801 75.3889Z" />
        <path d="M231.398 66.1086V196.756L116.276 262.088L1.15538 196.756V66.1086L116.276 0.777588L231.398 66.1086Z" />
      </svg>

      {/* M shape */}
      <svg
        className="absolute bottom-0 left-0 -z-20 w-60 -translate-x-1/4 translate-y-1/4 rotate-[30deg] stroke-greenish-blue stroke-2"
        viewBox="0 0 276 244"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M229.022 158.749V0.74881L115.022 0.74881L1.02188 0.74881L1.02188 158.749L115.022 68.2488L229.022 158.749Z" />
      </svg>

      {/* Square star */}
      <svg
        className="absolute top-1/12 right-0 -z-20 w-20 -translate-x-1/4 rotate-[30deg] stroke-brilliant-green stroke-1 sm:top-2/12 sm:right-1/12 sm:translate-x-0"
        viewBox="0 0 159 159"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M108.037 50.9053L108.058 50.9424L108.095 50.9629L158.688 79.5L108.095 108.037L108.058 108.058L108.037 108.095L79.5 158.688L50.9629 108.095L50.9424 108.058L50.9053 108.037L0.310547 79.5L50.9053 50.9629L50.9424 50.9424L50.9629 50.9053L79.5 0.310547L108.037 50.9053Z" />
      </svg>

      {/* Rounded square */}
      <svg
        className="absolute top-1/12 left-3/12 -z-20 hidden w-20 -rotate-12 stroke-brilliant-green stroke-1 opacity-50 sm:top-0 sm:left-2/12 sm:block sm:translate-y-1/2"
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M28.2145 6.58659C35.7988 -0.997595 48.096 -0.997693 55.6803 6.58659L77.3073 28.2145C84.8916 35.7988 84.8916 48.096 77.3073 55.6803L55.6803 77.3073C48.096 84.8916 35.7988 84.8916 28.2145 77.3073L6.58658 55.6803C-0.9977 48.0961 -0.9976 35.7989 6.58658 28.2145L28.2145 6.58659Z" />
      </svg>
    </div>
  );
};

export default Background;
