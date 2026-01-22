
import { Routes, Route } from 'react-router-dom'
import WaiterDashboard from './pages/WaiterDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WaiterDashboard />} />
    </Routes>
  )
}
