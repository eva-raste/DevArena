import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/hello")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>JAY DIWALI</h1>
      <h1>everything is working fine</h1>
      <p style={{ fontSize: "18px", color: "green" }}>
        {message || "Loading..."}
      </p>
    </div>
  );
}

export default App;
