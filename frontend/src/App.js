import React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { NEXT_PUBLIC_SOLANA_NETWORK } from "./constants/sol";
import "@solana/wallet-adapter-react-ui/styles.css";

import Home from './Pages/index'
import AllCollection from './Pages/AllCollections'
import Admin from './Pages/Admin'
import Collection from './Pages/collections'
import Profile from './Pages/Profile'
import NftDetail from "./Pages/NftDetail";
import NftEtherDetail from "./Pages/NftDetail/Ether";
import IconsList from './Pages/IconsList'

import "./App.css";
import "./base.scss";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { RPC_HOST } from "./config";
function App() {
  // const endPoint = React.useMemo(() => "https://solana-api.projectserum.com", []);
  const endPoint = React.useMemo(() => RPC_HOST, []);

  const wallets = React.useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new SolletWalletAdapter({ NEXT_PUBLIC_SOLANA_NETWORK }),
    new LedgerWalletAdapter(),
    new TorusWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolletExtensionWalletAdapter({ NEXT_PUBLIC_SOLANA_NETWORK }),
  ], [])

  return (
    <ConnectionProvider endpoint={endPoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<AllCollection />} />
              <Route path="/collection/:chain/:name" element={<Collection />} />
              
              <Route path="/collection/solana/:name/:address" element={<NftDetail />} />
              <Route path="/collection/ether/:contractAddress/:tokenId" element={<NftEtherDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/icons" element={<IconsList />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </ConnectionProvider>
  );
}

export default App;
