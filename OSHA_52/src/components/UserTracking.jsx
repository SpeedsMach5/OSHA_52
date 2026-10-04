import React, { useState } from "react";

// User management hooks and state
function useUserProgress() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("osha_user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (name) => {
    const userData = {
      name,
      startDate: new Date().toISOString(),
      completedWeeks: [],
      quizScores: {},
      achievements: [],
      streaks: {
        current: 0,
        longest: 0,
        lastCompleted: null,
      },
    };
    localStorage.setItem("osha_user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateProgress = (weekNum, quizScore) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      completedWeeks: [...new Set([...user.completedWeeks, weekNum])],
      quizScores: { ...user.quizScores, [weekNum]: quizScore },
    };

    // Update streak
    const today = new Date();
    const lastComplete = user.streaks.lastCompleted
      ? new Date(user.streaks.lastCompleted)
      : null;

    if (lastComplete) {
      const daysDiff = Math.floor(
        (today - lastComplete) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 1) {
        updatedUser.streaks.current += 1;
        updatedUser.streaks.longest = Math.max(
          updatedUser.streaks.current,
          updatedUser.streaks.longest
        );
      } else {
        updatedUser.streaks.current = 1;
      }
    } else {
      updatedUser.streaks.current = 1;
      updatedUser.streaks.longest = 1;
    }

    updatedUser.streaks.lastCompleted = today.toISOString();

    // Check and award achievements
    updatedUser.achievements = calculateAchievements(updatedUser);

    localStorage.setItem("osha_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return { user, handleLogin, updateProgress };
}

// Achievement system
const calculateAchievements = (user) => {
  const achievements = [];

  // Progress based
  if (user.completedWeeks.length >= 10) achievements.push("Safety Scout");
  if (user.completedWeeks.length >= 25) achievements.push("Safety Expert");
  if (user.completedWeeks.length >= 52) achievements.push("Safety Master");

  // Quiz performance
  const perfectScores = Object.values(user.quizScores).filter(
    (score) => score === 100
  ).length;
  if (perfectScores >= 5) achievements.push("Quiz Whiz");
  if (perfectScores >= 20) achievements.push("Safety Scholar");

  // Streaks
  if (user.streaks.longest >= 5) achievements.push("Consistency Champion");
  if (user.streaks.longest >= 10) achievements.push("Safety Streak Star");

  return [...new Set(achievements)];
};

// Initial login component
const LoginForm = ({ onLogin }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome to OSHA Training</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Training
          </button>
        </form>
      </div>
    </div>
  );
};

// Main UserTracking component
const UserTracking = () => {
  const { user, handleLogin, updateProgress } = useUserProgress();

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return null; // or redirect to main content
};

export default UserTracking;
