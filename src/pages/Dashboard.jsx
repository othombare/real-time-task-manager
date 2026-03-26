const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">

      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-4 flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Task Manager
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hello, User 👋</span>
          <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Tasks Due Today
          </h2>
          <p className="text-3xl font-bold text-blue-600">5</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Completed Tasks
          </h2>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Pending Tasks
          </h2>
          <p className="text-3xl font-bold text-red-500">3</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3">
          <li className="text-gray-600">✔ Task "Design UI" completed</li>
          <li className="text-gray-600">➕ New task "Fix bugs" added</li>
          <li className="text-gray-600">🔄 Task "API integration" updated</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;