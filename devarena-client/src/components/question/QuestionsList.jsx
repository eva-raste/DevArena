import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/QuestionsList.module.css';
import { fetchQuestionsApi } from '../../apis/question-api'

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, EASY, MEDIUM, HARD
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {


      // fetching all questions of current user
      const data = await fetchQuestionsApi();
      setQuestions(data);
      setError(null);

    } catch (err) {
      setError(err.message || "Failed to fetch questions");
    }
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'HARD':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

    const filteredQuestions = questions.filter((q) => {
        const matchesFilter =
        filter === 'ALL' || q.difficulty === filter

        const matchesSearch =
        searchQuery === '' ||
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.questionSlug?.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesFilter && matchesSearch
    })

  const handleCardClick = (slug) => {
    navigate(`/question/${slug}`);
  };


  const handleCreateNew = () => {
    navigate('/create-question');
  };



  return (
    <div className={`${styles.pageContainer} p-6`}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Questions Library
            </h1>
            <p className="text-gray-400">
              Browse and manage all coding questions
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-linear-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white rounded-2xl transition-all shadow-lg font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Question
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchQuestions}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full bg-gray-800/50 text-gray-100 rounded-2xl pl-12 pr-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
            <button
                key={diff}
                onClick={() => setFilter(diff)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === diff
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                }`}
            >
                {diff}
            </button>
            ))}
          </div>
        </div>

        {/* Questions Count */}
        <div className="mb-4 text-gray-400">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>

        {/* Questions Grid */}
{/*         {filteredQuestions.length === 0 ? ( */}
{/*           <div className="text-center py-20"> */}
{/*             <svg */}
{/*               className="w-20 h-20 mx-auto text-gray-600 mb-4" */}
{/*               fill="none" */}
{/*               stroke="currentColor" */}
{/*               viewBox="0 0 24 24" */}
{/*             > */}
{/*               <path */}
{/*                 strokeLinecap="round" */}
{/*                 strokeLinejoin="round" */}
{/*                 strokeWidth={1.5} */}
{/*                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" */}
{/*               /> */}
{/*             </svg> */}
{/*             <p className="text-gray-400 text-lg mb-2">No questions found</p> */}
{/*             <p className="text-gray-500 text-sm"> */}
{/*               {searchQuery || filter !== 'all' */}
{/*                 ? 'Try adjusting your filters' */}
{/*                 : 'Create your first question to get started'} */}
{/*             </p> */}
{/*           </div> */}
{/*         ) : ( */}
          <div className={styles.gridContainer}>
            {filteredQuestions.map((question) => (
                <div
                  key={question.questionSlug}
                  onClick={() => handleCardClick(question.questionSlug)}
                  className={`${styles.questionCard} cursor-pointer`}
                >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-100 flex-1 pr-4">
                    {question.title || 'Untitled Question'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border whitespace-nowrap ${getDifficultyColor(
                      question.difficulty
                    )}`}
                  >
                    {question.difficulty || 'N/A'}
                  </span>
                </div>

                {/* Slug */}
                {question.questionSlug && (
                  <p className="text-gray-500 text-sm font-mono mb-3">
                    /{question.questionSlug}
                  </p>
                )}

                {/* Description Preview */}
                {question.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {question.description}
                  </p>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {(question.sampleTestcases?.length || 0) +
                        (question.hiddenTestcases?.length || 0)}{' '}
                      tests
                    </span>
                  </div>
                  <span className="text-teal-400 font-bold">
                    {question.score || 0} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsList;