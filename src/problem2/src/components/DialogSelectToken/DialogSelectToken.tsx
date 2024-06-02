import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Loading,
  TokenImage,
} from "@components";
import { useGetTokensPrice } from "@hooks/price";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export interface DialogSelectTokenProps {
  selected?: string;
  renderTrigger: React.ReactNode;
  onChangeToken?: (token: string) => void;
}

export function DialogSelectToken(props: DialogSelectTokenProps) {
  const { renderTrigger, selected, onChangeToken } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const listTokens = useGetTokensPrice();

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFilter(event.target.value);
  }

  function handleSelectToken(token: string) {
    onChangeToken?.(token);
    setIsOpen(false);
  }

  const listTokensFiltered = useMemo(() => {
    if (!listTokens.data) return undefined;
    return listTokens.data.filter((token) =>
      token.currency.toLowerCase().includes(filter.toLowerCase())
    );
  }, [listTokens.data, filter]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setFilter("");
      }}
    >
      <DialogTrigger className="flex-shrink-0">{renderTrigger}</DialogTrigger>
      <DialogContent className="lg:max-w-screen-sm overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <div className="pt-4">
            <input
              type="text"
              className="w-full bg-[#2B3342] py-2 px-4 rounded-lg"
              placeholder="Search token"
              onChange={handleFilterChange}
              value={filter}
            />
            {listTokens.isLoading && (
              <div className="mt-4 flex justify-center pt-4 text-3xl">
                <Loading />
              </div>
            )}
            {!listTokens.isLoading &&
              !listTokens.error &&
              listTokensFiltered?.length === 0 && (
                <p className="mt-4 text-center font-bold">No results found</p>
              )}
            {listTokensFiltered && listTokensFiltered.length > 0 && (
              <ul className="mt-4 space-y-2 overflow-y-scroll max-h-[600px]">
                {listTokensFiltered.map((token) => (
                  <li key={token.currency}>
                    <button
                      className={twMerge(
                        "px-4 py-2 flex items-center w-full hover:bg-[#252B36]",
                        selected === token.currency && "bg-[#252B36] opacity-80"
                      )}
                      onClick={() => handleSelectToken(token.currency)}
                    >
                      <TokenImage className="w-6 h-6" token={token.currency} />
                      <span className="font-bold ml-2">{token.currency}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
