import React from 'react';

const TextboxEssay = ({ width = '100vh', height = '20vh', placeholder = 'Isi Jawaban Anda' }) => {
  return (
    <div className="flex-col">
      <h1 className="m-5">21. Soal Nanti Ada Disini</h1>
      <textarea
        className={`bg-[#252A3C] rounded-[10px] text-white-500 shadow-[0px_1px_3px_rgba(255,255,255,5)] m-5 mb-[35px] text-left border p-[15px] border-white resize-none placeholder:text-left placeholder:align-top focus:outline-none`}
        style={{ width, height }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextboxEssay;

//  Nanti pas di call sisa <TextboxEssay width="80vw" height="25vh" />
