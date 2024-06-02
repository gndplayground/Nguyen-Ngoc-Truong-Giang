import { useMutation } from "@tanstack/react-query";
import Decimal from "decimal.js";
import { useToast } from "./toast";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useSwap() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { from: string | Decimal; token: string }) => {
      await wait(3000);
      return { from: data.token, token: data.from };
    },
    onSuccess: () => {
      toast({
        title: "Swap success",
        description: "Your swap has been successfully processed",
      });
    },
  });
}
