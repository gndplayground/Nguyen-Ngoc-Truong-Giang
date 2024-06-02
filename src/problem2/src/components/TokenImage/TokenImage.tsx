import { useEffect, useRef, useState } from "react";

export interface TokenImage extends React.HTMLProps<HTMLImageElement> {
  token: string;
}

export function TokenImage({ token: currency, ...otherProps }: TokenImage) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  function setUp(r: (HTMLImageElement | SVGSVGElement) | null) {
    if (r) {
      observer.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setLoading(false);
            }
          }
        },
        { rootMargin: "30px" }
      );
      observer.current.observe(r);
    }
  }

  useEffect(() => {
    setError(false);
  }, [currency]);

  if (error || loading)
    return (
      <svg
        ref={(r) => {
          setUp(r);
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...(otherProps as any)}
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
      </svg>
    );

  return (
    <img
      ref={(r) => {
        setUp(r);
      }}
      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`}
      alt={`${currency} token`}
      onError={() => {
        setError(true);
        observer.current?.disconnect();
      }}
      onLoad={() => {
        observer.current?.disconnect();
      }}
      loading="lazy"
      {...otherProps}
    />
  );
}
