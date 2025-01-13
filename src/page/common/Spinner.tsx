import React from 'react';
import SpinnerImg from '/spinner.gif';

export default function Spinner() {
  return (
    <div>
      <img src={SpinnerImg} alt="불러오는 중" className="size-[120px]" />
    </div>
  );
}
