import { Routes, Route, Link } from "react-router-dom";
import Home from "./Component/home"
import Problemset from "./Component/ProblemSet"
import Solve from "./Component/solve"
import CreateContest from "./Component/contest/CreateContest";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problemset" element={<Problemset />} />
{/*         <Route path="/solve/:id" element={<Solve />} /> */}
        <Route path="/solve/:slug" element={<Solve />} />
        <Route path="/create-contest" element = {<CreateContest />} />

      </Routes>
    </div>
  );
}

export default App;