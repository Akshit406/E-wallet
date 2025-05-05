import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Homepage from "./components/Homepage/Homepage";
import Send from "./components/Send/Send";
import Recieve from "./components/Recieve/Recieve";
import Passphrase from "./components/Passphrase/Passphrase";
import WalletCreated from "./components/WalletCreated/WalletCreated";
import Login from "./components/Login/Login";
import ChooseAmount from "./components/ChooseAmount/ChooseAmount";
import Transactions from "./components/Transactions/Transactions";

import "./App.css";

const App = () => {
  const storedWallet = localStorage.getItem("wallet");

  return (
      <Routes>
        <Route path="/" element={storedWallet ? <Homepage /> : <Login />} />
        <Route path="/create" element={<WalletCreated />} />
        <Route path="/import" element={<Passphrase />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/send" element={<Send />} />
        <Route path="/ChooseAmount" element={<ChooseAmount />} />
        <Route path="/recieve" element={<Recieve />} />
        <Route path="/share" element={<Transactions />} />
      </Routes>
  );
};

export default App;
