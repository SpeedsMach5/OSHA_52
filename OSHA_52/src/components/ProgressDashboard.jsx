import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, CheckCircle, Clock } from "lucide-react";

const ProgressDashboard = ({ user }) => {
  const {
    completedWeeks = [],
    quizScores = {},
    achievements = [],
    lastAccessed,
  } = user || {};

  const completionRate = (completedWeeks.length / 52) * 100;
  const averageScore =
    Object.values(quizScores).reduce((a, b) => a + b, 0) /
      Object.values(quizScores).length || 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Training Progress</h2>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-2 w-full" />
          <p className="mt-2 text-sm text-gray-600">
            {completedWeeks.length} of 52 weeks completed (
            {completionRate.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          title="Average Score"
          value={`${averageScore.toFixed(1)}%`}
        />
        <StatCard
          icon={<Award className="h-5 w-5 text-yellow-500" />}
          title="Achievements"
          value={achievements.length}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          title="Last Activity"
          value={
            lastAccessed ? new Date(lastAccessed).toLocaleDateString() : "N/A"
          }
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          {completedWeeks.slice(-3).map((week) => (
            <div key={week} className="flex items-center justify-between py-2">
              <span>Week {week} Completed</span>
              <span className="text-green-600">{quizScores[week]}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Next Steps</h3>
        </CardHeader>
        <CardContent>
          {completedWeeks.length < 52 ? (
            <p>
              Continue with Week{" "}
              {Math.min(
                ...Array.from({ length: 52 }, (_, i) => i + 1).filter(
                  (w) => !completedWeeks.includes(w)
                )
              )}
            </p>
          ) : (
            <p>All modules completed! Review any topics as needed.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default ProgressDashboard;
