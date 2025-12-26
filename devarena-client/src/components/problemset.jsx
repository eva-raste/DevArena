import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProblemSet = ()=>
{
    const navigate = useNavigate();
    const [problems,setProblems]=useState([]);

    const questions = [
      { id: 1, title: "What is React?" },
      { id: 2, title: "Explain useState hook" },
    ];

     useEffect(()=>
    {
        setProblems(questions);
        },[]);

    const handleSolve = (id) => {
      navigate(`/solve/${id}`);
    };

    return(
        problems.map(p => (
          <div key={p.id}>
            <p>{p.title}</p>
            <button onClick={() => handleSolve(p.id)}>Solve</button>
          </div>
        ))
        )
}

export default ProblemSet;