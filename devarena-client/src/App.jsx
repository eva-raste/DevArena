import { Routes, Route} from "react-router-dom";
import Home from "./Component/home"
import Problemset from "./Component/ProblemSet"
import Solve from "./Component/solve"
import CreateQuestion from "./Component/question/CreateQuestion";
import QuestionsList from "./Component/question/QuestionsList";
import CreateContest from "./Component/contest/CreateContest";
import Root from "./Component/Root";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Root />}>

          <Route path="/" element={<Home />} />
          <Route path="/problemset" element={<Problemset />} />
  {/*         <Route path="/solve/:id" element={<Solve />} /> */}
          <Route path="/solve/:slug" element={<Solve />} />
          <Route path="/create-question" element={ <CreateQuestion /> }/>
          <Route path="/show-all-questions" element={ <QuestionsList /> }/>
          <Route path="/create-contest" element={<CreateContest />} />
        </Route>

        {/* <Route path="/create-contest" element = {<CreateContest />} /> */}

      </Routes>
    </div>
  );
}

export default App;