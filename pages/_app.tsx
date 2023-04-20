import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
  // thirdweb provider coonect to localhost port 8545 
    <ThirdwebProvider 
      desiredChainId={ChainId.Goerli}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
