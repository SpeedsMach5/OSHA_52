import React from 'react'
import WeeklyTests from './components/WeeklyTests'
import ProgressDashboard from './components/ProgressDashboard'
import UserTracking from './components/UserTracking'

function App() {
  return (
    <div className="container mx-auto p-4">
      <UserTracking />
      <ProgressDashboard />
      <WeeklyTests />
    </div>
  )
}

export default App