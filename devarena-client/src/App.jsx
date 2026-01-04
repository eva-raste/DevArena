import { Routes, Route} from "react-router-dom";
import Home from "./components/home"
import Problemset from "./components/ProblemSet"
import Solve from "./components/solve"
import CreateQuestion from "./components/question/CreateQuestion";
import QuestionsList from "./components/question/QuestionsList";
import CreateContest from "./components/contest/CreateContest";
import Root from "./components/Root";
import Login from "./components/authentication/login";
import Signup from "./components/authentication/signup";
import ContestsPage from "./components/contest/ContestsPage";
import QuestionSolve from "./components/question/QuestionSolve";
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
          <Route path="/my-contests" element={ < ContestsPage />} />
          <Route path="/question/:slug" element={<QuestionSolve />} />

        </Route>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        {/* <Route path="/create-contest" element = {<CreateContest />} /> */}

      </Routes>
    </div>
  );
}

export default App;