import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User, Trophy, Code, FileText, Calendar, TrendingUp } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulating API call with mock data
    // Replace this with your actual fetchProfileApi call
    const fetchProfile = async () => {
      try {
        // const data = await fetchProfileApi();

        // Mock data for demonstration
        const mockData = {
          user: {
            name: 'John Doe',
            username: 'johndoe_coder',
            email: 'john@example.com',
            joinDate: '2023-06-15',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
          },
          stats: {
            totalContests: 45,
            contestsAttended: 38,
            totalSubmissions: 342,
            questionsAttempted: 156,
            questionsSolved: 128,
            globalRank: 1247,
            rating: 1856
          },
          problemStats: {
            easy: { solved: 68, total: 120 },
            medium: { solved: 45, total: 80 },
            hard: { solved: 15, total: 40 }
          },
          recentContests: [
            { name: 'Weekly Contest 382', rank: 234, score: 12, date: '2024-01-15' },
            { name: 'Biweekly Contest 120', rank: 189, score: 15, date: '2024-01-10' },
            { name: 'Weekly Contest 381', rank: 312, score: 8, date: '2024-01-08' },
            { name: 'Weekly Contest 380', rank: 156, score: 18, date: '2024-01-01' }
          ],
          monthlyProgress: [
            { month: 'Aug', solved: 12 },
            { month: 'Sep', solved: 18 },
            { month: 'Oct', solved: 22 },
            { month: 'Nov', solved: 28 },
            { month: 'Dec', solved: 25 },
            { month: 'Jan', solved: 23 }
          ],
          recentSubmissions: [
            { id: 1, title: 'Two Sum', difficulty: 'Easy', status: 'Accepted', time: '2 hours ago' },
            { id: 2, title: 'Binary Tree Inorder', difficulty: 'Medium', status: 'Accepted', time: '5 hours ago' },
            { id: 3, title: 'Trapping Rain Water', difficulty: 'Hard', status: 'Wrong Answer', time: '1 day ago' },
            { id: 4, title: 'Valid Parentheses', difficulty: 'Easy', status: 'Accepted', time: '2 days ago' }
          ]
        };

        setProfile(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  const problemData = [
    { name: 'Easy', value: profile.problemStats.easy.solved, color: '#22c55e' },
    { name: 'Medium', value: profile.problemStats.medium.solved, color: '#f59e0b' },
    { name: 'Hard', value: profile.problemStats.hard.solved, color: '#ef4444' }
  ];

  const activityData = [
    { name: 'Contests', value: profile.stats.contestsAttended },
    { name: 'Submissions', value: Math.min(profile.stats.totalSubmissions, 400) },
    { name: 'Questions', value: profile.stats.questionsSolved }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={profile.user.avatar}
              alt={profile.user.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{profile.user.name}</h1>
              <p className="text-gray-600">@{profile.user.username}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date(profile.user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Global Rank</p>
                  <p className="text-xl font-bold text-blue-600">#{profile.stats.globalRank}</p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-xl font-bold text-green-600">{profile.stats.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Contests Attended</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{profile.stats.contestsAttended}</p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{profile.stats.totalSubmissions}</p>
              </div>
              <Code className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Questions Solved</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{profile.stats.questionsSolved}</p>
              </div>
              <FileText className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Questions Attempted</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{profile.stats.questionsAttempted}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('contests')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'contests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Contests
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Submissions
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Problems Solved Pie Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Problems Solved by Difficulty</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={problemData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {problemData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Easy</p>
                        <p className="font-semibold text-green-600">
                          {profile.problemStats.easy.solved}/{profile.problemStats.easy.total}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Medium</p>
                        <p className="font-semibold text-yellow-600">
                          {profile.problemStats.medium.solved}/{profile.problemStats.medium.total}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Hard</p>
                        <p className="font-semibold text-red-600">
                          {profile.problemStats.hard.solved}/{profile.problemStats.hard.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Bar Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Progress */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Progress</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={profile.monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="solved" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'contests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Contests</h3>
                <div className="space-y-3">
                  {profile.recentContests.map((contest, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <div>
                          <p className="font-medium text-gray-800">{contest.name}</p>
                          <p className="text-sm text-gray-600">{new Date(contest.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Rank: <span className="font-semibold">{contest.rank}</span></p>
                        <p className="text-sm text-gray-600">Score: <span className="font-semibold">{contest.score}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Submissions</h3>
                <div className="space-y-3">
                  {profile.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <Code className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">{submission.title}</p>
                          <p className="text-sm text-gray-600">{submission.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          submission.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          submission.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {submission.difficulty}
                        </span>
                        <p className={`text-sm font-semibold mt-1 ${
                          submission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;