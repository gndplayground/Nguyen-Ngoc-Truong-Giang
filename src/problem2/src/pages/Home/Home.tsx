import { Loading, Toaster, InputToken } from "@components";
import { SwapArrow } from "@components/icons";
import { useGetPairPrice } from "@hooks/price";
import { useSwap } from "@hooks/swap";
import { useState } from "react";

const regex = /^[0-9]*\.?[0-9]*$/;

export function HomePage() {
  const [direction, setDirection] = useState<"from" | "to">("from");
  const [fromToken, setFromToken] = useState<string>("USD");
  const [toToken, setToToken] = useState<string>("ETH");

  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");

  const { formatted, amountPriceFormatted, raw } = useGetPairPrice({
    fromToken,
    toToken,
    amountFrom: fromValue,
    amountTo: toValue,
    direction,
  });

  const swap = useSwap();

  function handleSwitchToken() {
    if (swap.isPending) return;
    setFromToken(toToken);
    setToToken(fromToken);
    if (direction === "from") {
      setFromValue(formatted || toValue);
      setToValue(fromValue || formatted || "");
      setDirection("to");
    } else {
      setFromValue(toValue || formatted || "");
      setToValue(formatted || fromValue);
      setDirection("from");
    }
  }

  function handleChangeFromValue(e: React.ChangeEvent<HTMLInputElement>) {
    if (!regex.test(e.target.value)) {
      return;
    }
    setFromValue(e.target.value);
    setDirection("from");
  }

  function handleChangeToValue(e: React.ChangeEvent<HTMLInputElement>) {
    if (!regex.test(e.target.value)) {
      return;
    }
    setToValue(e.target.value);
    setDirection("to");
  }

  const notAllowed = swap.isPending || !fromValue || fromValue === "0";
  const noBalance = !fromValue || fromValue === "0";
  return (
    <main className="py-10">
      <section className="max-w-lg mx-auto rounded-lg py-6 pt-4 px-4 bg-[#28292C] text-[#fff]">
        <h1 className="font-bold">Swap</h1>
        <form className="mt-4">
          <div className="mb-2">
            <InputToken
              disabled={swap.isPending}
              selectedToken={fromToken}
              onChangeToken={setFromToken}
              label="From"
              inputProps={{
                value: direction === "from" ? fromValue : formatted,
                onChange: handleChangeFromValue,
              }}
              className="pb-8"
            />
          </div>
          <div className="relative">
            <div className="absolute inline-flex rounded-full p-1.5 bg-[#28292C] -top-1.5 -translate-y-1/2 left-1/2">
              <button
                type="button"
                className="rounded-full p-2 bg-[#2B3342] text-lg"
                onClick={handleSwitchToken}
              >
                <SwapArrow />
              </button>
            </div>
            <InputToken
              disabled={swap.isPending}
              selectedToken={toToken}
              onChangeToken={setToToken}
              label="To"
              inputProps={{
                value: direction === "to" ? toValue : formatted,
                onChange: handleChangeToValue,
              }}
              priceAmount={amountPriceFormatted}
            />
          </div>
          <button
            type="button"
            disabled={notAllowed}
            className="block mt-4 w-full bg-[#4D6CFA] text-[#fff] py-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => {
              swap.mutate({
                token: fromToken,
                from: direction === "from" ? fromValue : raw,
              });
            }}
          >
            {swap.isPending ? <Loading /> : noBalance ? "Enter amount" : "Swap"}
          </button>
        </form>
      </section>

      <Toaster />
    </main>
  );
}
