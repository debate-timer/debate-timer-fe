interface LoginAndStoreDBModalProps {
  children: React.ReactNode;
  onSaveAndLogin: () => void;
  onOnlyLogin: () => void;
}

export default function LoginAndStoreDBModal({
  children,
  onSaveAndLogin,
  onOnlyLogin,
}: LoginAndStoreDBModalProps) {
  return (
    <div className="flex w-[500px] flex-col items-center justify-center space-y-10 p-[40px]">
      <div className="relative flex flex-col items-center justify-center space-y-6 rounded-2xl p-10">
        <p className="text-center text-[20px] font-semibold text-neutral-800">
          {children}
        </p>
      </div>

      <div className="flex w-full flex-col space-y-4">
        <button className="button enabled" onClick={onSaveAndLogin}>
          네, 로그인하고 저장할게요.
        </button>
        <button className="button enabled" onClick={onOnlyLogin}>
          아니요, 로그인만 할게요
        </button>
      </div>
    </div>
  );
}
