import { ButtonHTMLAttributes } from 'react';
import { FcGoogle } from 'react-icons/fc';
export default function GoogleButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      className="
        mx-auto my-4 flex scale-150 transform items-center
        justify-center
        rounded bg-white  px-2 py-3 text-sm shadow hover:bg-gray-100
      "
    >
      <FcGoogle className="mr-5 h-5 w-5" />
      <span className="text-black-54 font-semibold">구글 계정으로 로그인</span>
    </button>
  );
}
