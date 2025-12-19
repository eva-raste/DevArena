import { useState } from "react";
import { useCreateContest } from "../../hooks/useCreateContest.js";

const CreateContest = () => {
  const [form, setForm] = useState({
    title: "",
    visibility: "PUBLIC",
    questionSlugs: "",
    instructions: "",
    startTime: "",
    endTime: ""
  });

  const { submit, loading, error, success } = useCreateContest();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      visibility: form.visibility,
      questionSlugs: form.questionSlugs
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      instructions: form.instructions || null,
      startTime: form.startTime || null,
      endTime: form.endTime || null
    };

    await submit(payload);
  };

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-14 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-slate-100 mb-8">
          Create Contest
        </h1>

        <form
          onSubmit={onSubmit}
          className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Contest Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
              className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={form.visibility}
              onChange={onChange}
              className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="INVITE_ONLY">Invite only</option>
            </select>
          </div>

          {/* Question slugs */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Question Slugs
            </label>
            <input
              name="questionSlugs"
              placeholder="tow-sum, sum-of-array"
              value={form.questionSlugs}
              onChange={onChange}
              required
              className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated slugs
            </p>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Instructions
            </label>
            <textarea
              name="instructions"
              rows={3}
              value={form.instructions}
              onChange={onChange}
              className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={onChange}
                className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={onChange}
                className="w-full bg-[#020617] border border-slate-700 rounded-md px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Contest"}
          </button>

          {/* Status */}
          {error && (
            <p className="text-sm text-red-400 mt-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-400 mt-3">{success}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateContest;
