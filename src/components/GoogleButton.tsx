import { ButtonHTMLAttributes } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { isEmbeddedWebView } from '../util/validateUserAgent';
import { MdOutlineErrorOutline } from 'react-icons/md';
export default function GoogleButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  // Check whether user-agent is acceptable and set background color
  const isDisabled = isEmbeddedWebView();
  const bgColor = isDisabled ? 'bg-gray-300' : 'bg-slate-100';
  const hoverBgColor = isDisabled ? '' : 'hover:bg-slate-200';
  console.log(isDisabled);

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Google login button */}
      <button
        {...props}
        className={`
        mx-auto my-4 flex scale-150 transform items-center
        justify-center
        rounded-full ${bgColor} px-8 py-2 text-sm shadow-lg ${hoverBgColor}
      `}
        disabled={isDisabled}
      >
        <div className="flex flex-row items-center">
          <FcGoogle size={24} className="mr-5" />
          <span className="font-semibold text-slate-900">
            Google 계정으로 로그인
          </span>
        </div>
      </button>

      {/* Error message */}
      {isDisabled && (
        <div className="flex w-max flex-row items-center space-x-2 text-red-500">
          <MdOutlineErrorOutline size={20} />
          <p className="text-sm font-normal">
            이 브라우저에서는 로그인이 불가능해요. 다른 웹 브라우저로
            접속해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
