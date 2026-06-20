"use client"

import React, { useState } from "react";
import SubmitAnswer from "@/components/modals/SubmitAnswer";

export default function TestSubmitAnswer() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <button
        className="mt-4 mb-4 px-6 py-2 rounded bg-green-700 text-white font-bold hover:bg-green-800 transition"
        onClick={() => setShowPopup(true)}
      >
        Show Submit Popup
      </button>
      <SubmitAnswer
        open={showPopup}
        onClose={() => setShowPopup(false)}
        onSubmit={() => { setShowPopup(false); }}
      />
    </>
  );
}