import { Routes, Route } from "react-router-dom";
import Home from "./components/home"
import CreateQuestion from "./components/question/CreateQuestion";
import QuestionsList from "./components/question/QuestionsList";
import CreateContest from "./components/contest/CreateContest";
import Root from "./components/Root";
import Login from "./components/authentication/login";
import Signup from "./components/authentication/signup";
import ContestsPage from "./components/contest/ContestsPage";
import QuestionSolve from "./components/question/QuestionSolve";
import ContestDetailsPage from "./components/contest/ContestDetailsPage";
import { useLoader } from "./components/loader/LoaderContext";
import GlobalLoader from "./components/loader/GlobalLoader";
import EditQuestionForm from "./components/question/EditQuestionForm";
import EditContestPage from "./components/contest/EditContestPage";
import Dashboard from "./components/dashboard/Dashboard";

import Profile from "./components/Profile";
function App() {
    const { loading } = useLoader();

    return (
        <div>
            {loading && <GlobalLoader />}
            <Routes>
                <Route path="/" element={<Root />}>

                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/create-question" element={<CreateQuestion />} />
                    <Route path="/questions/:slug/edit" element={<EditQuestionForm />} />
                    <Route path="/show-all-questions" element={<QuestionsList />} />
                    
                    <Route path="/create-contest" element={<CreateContest />} />
                    <Route path="/my-contests" element={< ContestsPage />} />
                    <Route path="/contests/:contestId" element={<ContestDetailsPage />} />
                    <Route path="/contests/edit/:roomId" element={<EditContestPage />} />

                    <Route path="/question/:slug" element={<QuestionSolve />} />
                    <Route path="/contests/:contestId/questions/:slug" element={<QuestionSolve />} />

                    <Route path="/profile" element={<Profile />} />

                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* <Route path="/create-contest" element = {<CreateContest />} /> */}

            </Routes>
        </div>
    );
}

export default App;