import { Routes, Route, Link } from "react-router-dom";
import Home from "./Component/home"
import Problemset from "./Component/ProblemSet"
import Solve from "./Component/solve"
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problemset" element={<Problemset />} />
{/*         <Route path="/solve/:id" element={<Solve />} /> */}
        <Route path="/solve/:slug" element={<Solve />} />

      </Routes>
    </div>
  );
}

export default App;