import { useState } from "react";
import { useCreateContest } from "../../hooks/useCreateContest.js";
import { fetchQuestionCard } from "../../apis/question-api.js";
const CreateContest = () => {
  const [form, setForm] = useState({
    title: "",
    visibility: "PUBLIC",
    instructions: "",
    startTime: "",
    endTime: ""
  });

  const [slugInput, setSlugInput] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionError, setQuestionError] = useState(null);
  const { submit, loading, error, success } = useCreateContest();

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add question on ENTER
  const handleSlugKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (!slugInput.trim()) return;

    try {
      setQuestionError(null);

      const card = await fetchQuestionCard(
        slugInput.trim()
      );

      // prevent duplicates
      if (
        questions.some((q) => q.questionSlug === card.questionSlug)
      ) {
        setQuestionError("Question already added");
        return;
      }

      setQuestions((prev) => [...prev, card]);
      setSlugInput("");
    } catch (err) {
      setQuestionError(err.message);
    }
  };

  const removeQuestion = (slug) => {
    const ok = window.confirm(
      "Remove this question from contest?"
    );
    if (!ok) return;

    setQuestions((prev) =>
      prev.filter((q) => q.questionSlug !== slug)
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      visibility: form.visibility,
      questionSlugs: questions.map((q) => q.questionSlug),
      instructions: form.instructions || null,
      startTime: form.startTime || null,
      endTime: form.endTime || null
    };

    await submit(payload);
  };

  return (
  <div
    className="
      min-h-screen
      bg-gray-50
      dark:bg-gradient-to-br
      dark:from-[#020617]
      dark:via-[#020617]
      dark:to-[#020617]
      px-4 sm:px-6 py-14
      flex justify-center
    "
  >
    <div className="w-full max-w-3xl">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-8">
        Create Contest
      </h1>

      <form
        onSubmit={onSubmit}
        className="
          bg-white
          dark:bg-[#0f172a]/90
          backdrop-blur
          border border-gray-200
          dark:border-slate-700/60
          rounded-2xl
          p-6 sm:p-8
          space-y-6
          shadow-xl
        "
      >
        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            className="
              w-full
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/40
              focus:border-indigo-500
            "
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Visibility
          </label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={onChange}
            className="
              w-full
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/40
              focus:border-indigo-500
            "
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="INVITE_ONLY">Invite only</option>
          </select>
        </div>

        {/* Question Picker */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Add Question
          </label>

          <input
            placeholder="question-slug"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            onKeyDown={handleSlugKeyDown}
            className="
              w-full
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/40
              focus:border-indigo-500
            "
          />

          {questionError && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              {questionError}
            </p>
          )}
        </div>

        {/* Question Cards */}
        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.questionSlug}
                className="
                  bg-gray-50
                  dark:bg-[#020617]
                  border border-gray-200
                  dark:border-slate-700/60
                  rounded-xl
                  p-4
                  hover:border-indigo-500/40
                  transition
                "
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-gray-900 dark:text-slate-100 font-medium">
                      {q.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {q.questionSlug} • {q.difficulty} • {q.score} pts
                    </p>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button
                      type="button"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.questionSlug)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-slate-300 mt-3 line-clamp-2">
                  {q.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Instructions
          </label>
          <textarea
            name="instructions"
            rows={3}
            value={form.instructions}
            onChange={onChange}
            className="
              w-full
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
              resize-y
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/40
              focus:border-indigo-500
            "
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="datetime-local"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            className="
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
            "
          />
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            className="
              bg-white
              dark:bg-[#020617]
              border border-gray-300
              dark:border-slate-700
              rounded-lg
              px-4 py-2.5
              text-gray-900
              dark:text-slate-100
            "
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            py-2.5
            rounded-lg
            font-medium
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Creating..." : "Create Contest"}
        </button>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
      </form>
    </div>
  </div>
)


};

export default CreateContest;
