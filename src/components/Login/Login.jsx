import React from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div class="login">
      <img src="/e-wallet.png"></img>
      <div className="generateNew" onClick={() => navigate("create")}>
        Generate New wallet
      </div>
      <div className="importExisting" onClick={() => navigate("import")}>
        Import Existing wallet
      </div>
    </div>
  );
};  

export default Login;
