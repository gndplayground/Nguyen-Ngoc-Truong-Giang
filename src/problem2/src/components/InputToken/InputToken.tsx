import { DialogSelectToken } from "@components/DialogSelectToken";
import { TokenImage } from "@components/TokenImage";
import { Down } from "@components/icons";
import { useId } from "react";
import { twMerge } from "tailwind-merge";

interface InputTokenProps {
  label: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onChangeToken?: (token: string) => void;
  selectedToken: string;
  id?: string;
  priceAmount?: string;
  disabled?: boolean;
  className?: string;
}

export function InputToken(props: InputTokenProps) {
  const {
    label,
    inputProps,
    onChangeToken,
    selectedToken,
    id,
    priceAmount,
    disabled,
    className,
  } = props;

  const autoGenId = useId();

  return (
    <div className={twMerge("bg-[#2B3342] py-2 px-4 rounded-lg", className)}>
      <div className="flex items-center">
        <label htmlFor={id || autoGenId} className="text-sm">
          {label}
          <span className="sr-only"> {selectedToken} </span>
        </label>
        <div className="ml-auto">
          <DialogSelectToken
            selected={selectedToken}
            onChangeToken={onChangeToken}
            renderTrigger={
              <div className="ml-2 bg-[#252B36] p-1 rounded-lg flex items-center gap-1 flex-shrink-0">
                <TokenImage className="w-5 h-5" token={selectedToken} />
                <span className="text-xs">{selectedToken}</span>
                <Down className="text-2xl" aria-hidden={true} />
              </div>
            }
          />
        </div>
      </div>
      <div className="flex items-center mt-1">
        <input
          id={id || autoGenId}
          className="w-full bg-transparent outline-none"
          type="text"
          placeholder="0.00"
          disabled={disabled}
          {...inputProps}
        />
      </div>
      {priceAmount && (
        <div className="text-right">
          <p className="text-xs">~{priceAmount} USD</p>
        </div>
      )}
    </div>
  );
}
