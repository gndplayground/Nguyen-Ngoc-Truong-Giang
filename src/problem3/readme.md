# Messy React

## Problem

- `formattedBalances` is not used in the code and not memoized.
- Declare a pure function `getPriority` inside a React component. We can move the `getPriority` function outside the component.
- The `Props` interface is not used in the `WalletPage` component so it can be removed.
- Missing `blockchain` property in the `WalletBalance` interface. I added the `blockchain` property to the `WalletBalance` interface.
- The sort function does not return 0 when the priorities are equal. It will cause the sorting to be incorrect.
- The filter function is incorrect. The `lhsPriority` variable is not defined. It should be `balancePriority`.
- The filter the balances with `balance.amount <= 0` but the condition should be `balance.amount > 0`.
- The `index` should not be used as the key in the `WalletRow` component. We can use the `balance.currency` and `balance.blockchain` as the key.

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
```

## Refactor code

```tsx
interface WalletBalance {
  currency: string;
  amount: number;

  // the code uses the `blockchain` property in the `WalletBalance` interface
  // but the `blockchain` property is not defined in the interface so I added it
  blockchain: string;
}

// extending the `WalletBalance` interface to include the `formatted` property
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// the `Props` interface is not used in the `WalletPage` component
// so it can be removed
// interface Props extends BoxProps {}

// We can define the blockchain priority as an object, maybe can reuse somewhere else
const blockchainPriority = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  // Should the `Neo` blockchain have the same priority as the `Zilliqa` blockchain?
  // If not, we can change the priority value to a different number
  Neo: 20,
};

// the getPriority is a pure function so we can move it outside the component
function getPriority(blockchain: string): number {
  return blockchainPriority[blockchain] || -99;
}

const WalletPage: React.FC<BoxProps> = (props) => {
  // the `children` prop is not used in the `WalletPage` component
  //const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices: {
    [key: string]: number;
  }[] = usePrices();

  const sortedBalances = useMemo<FormattedWalletBalance[]>(() => {
    // combine the filter and map functions to avoid iterating the balances twice
    return balances
      .reduce((acc: FormattedWalletBalance[], balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (balancePriority > -99 && balance.amount > 0) {
          acc.push({
            ...balance,
            formatted: balance.amount.toFixed(),
          });
        }
        return acc;
      }, [])
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // Simplify the sorting function
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]);

  const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
    // The usdValue calculation is not that expensive so we can do it here
    // Incase the calculation is expensive, we can memoize it using useMemo
    // If the `prices` object is not expected to change much, we can add it as a dependency to useMemo in sortedBalances
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      // WalletRow can be a memo component to avoid re-rendering if our list is large.
      // Since I don't have the src code, I just suggest it.
      <WalletRow
        // Assuming classes is defined, maybe from a CSS-in-JS library or CSS module
        className={classes.row}
        // using the `index` as the key is not recommended
        // key={index}
        // using the `balance.currency` and `balance.blockchain` as the key. Some blockchains may have the same currency
        key={balance.blockchain + balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...props}>{rows}</div>;
};
```
