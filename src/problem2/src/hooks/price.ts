import { useQuery } from "@tanstack/react-query";
import { TokenPrice } from "@types";
import { useMemo } from "react";
import Decimal from "decimal.js";

export function useGetTokensPrice() {
  return useQuery({
    queryKey: ["prices"],
    queryFn: async () => {
      const price = await fetch(
        "https://interview.switcheo.com/prices.json"
      ).then<TokenPrice[]>((res) => res.json());

      const mapTokens = new Map<string, TokenPrice>();

      price.forEach((token) => {
        const current = mapTokens.get(token.currency);
        if (current && current.date > token.date) {
          return;
        }
        mapTokens.set(token.currency, token);
      });

      return Array.from(mapTokens.values()) as TokenPrice[];
    },
  });
}

function formatPrice(num: Decimal) {
  const [integerPart, decimalPart] = num
    .toSignificantDigits(10)
    .toString()
    .split(".");

  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  return decimalPart
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart;
}

export function useGetPairPrice({
  fromToken,
  toToken,
  amountFrom,
  amountTo,
  direction,
}: {
  fromToken?: string;
  toToken?: string;
  amountFrom?: string;
  amountTo?: string;
  direction: "from" | "to";
}) {
  const prices = useGetTokensPrice();

  const { fromPrice, toPrice } = useMemo(() => {
    if (fromToken && toToken) {
      const fromPrice = prices.data?.find(
        (token) => token.currency === fromToken
      )?.price;
      const toPrice = prices.data?.find(
        (token) => token.currency === toToken
      )?.price;

      return {
        fromPrice: new Decimal(fromPrice || 0),
        toPrice: new Decimal(toPrice || 0),
      };
    }
    return {
      fromPrice: new Decimal(0),
      toPrice: new Decimal(0),
    };
  }, [fromToken, toToken, prices.data]);

  const final = useMemo(() => {
    let result = new Decimal(0);
    let amountPrice = new Decimal(0);
    if (direction === "from") {
      const from = new Decimal(amountFrom || "0");
      result = from.eq(0) ? new Decimal(0) : from.div(toPrice).mul(fromPrice);

      amountPrice = fromPrice.mul(new Decimal(amountFrom || "0"));
    } else {
      const to = new Decimal(amountTo || "0");
      result = to.eq(0) ? new Decimal(0) : to.div(fromPrice).mul(toPrice);

      amountPrice = toPrice.mul(new Decimal(amountTo || "0"));
    }

    return {
      raw: result,
      formatted: result.eq("0") ? "0" : result.toString(),
      amountPrice,
      amountPriceFormatted: formatPrice(amountPrice),
    };
  }, [amountFrom, amountTo, direction, fromPrice, toPrice]);

  return {
    ...final,
  };
}
