// components/MaintenancePage.js or pages/maintenance.js
import React from "react";

const MaintenancePage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl sm:p-12 dark:bg-gray-800">
        <div className="mb-6 animate-bounce text-6xl text-yellow-500 dark:text-yellow-400">
          🚧
        </div>
        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl dark:text-white">
          Under Maintenance
        </h1>
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          We're performing some essential maintenance on our website. We
          apologize for any inconvenience this may cause.
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Please check back soon! We appreciate your patience.
        </p>
        <div className="mt-8">
          {/* Added a link back to home */}
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm transition duration-300 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
