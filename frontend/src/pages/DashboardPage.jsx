import { useQuery } from '@tanstack/react-query'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

import { studentsAPI } from '../services/api'
import { useEffect } from 'react'

const GENDER_COLORS = {
  male:   '#4f46e5',
  female: '#ec4899',
  other:  '#f59e0b',
}

// ── Small stat card ──────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="card h-100">
    <div className="card-body">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
)

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => studentsAPI.getDashboard().then((res) => res.data),
  })

    useEffect(() => {
    document.title = "Dashboard";
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
        <div className="spinner-border text-primary" />
      </div>
    )
  }

  const genderData = (data?.byGender || []).map((item) => ({
    name:  item.gender.charAt(0).toUpperCase() + item.gender.slice(1),
    value: item.count,
    color: GENDER_COLORS[item.gender] || '#94a3b8',
  }))

  return (
    <div>
      <h1 className="fw-bold mb-1">Dashboard</h1>
      <p className="text-muted small mb-4">Overview of students and activity</p>

      {/* ── Stat cards ── */}
      <div className="row g-3 mb-4">
        <div className="col-4 col-lg-4">
          <StatCard icon="bi-people-fill"       label="Total Students"    value={data?.counts?.total    || 0} color="#4f46e5" />
        </div>
        <div className="col-4 col-lg-4">
          <StatCard icon="bi-person-check-fill" label="Active Students"   value={data?.counts?.active   || 0} color="#10b981" />
        </div>
        <div className="col-4 col-lg-4">
          <StatCard icon="bi-person-dash-fill"  label="Inactive Students" value={data?.counts?.inactive || 0} color="#ef4444" />
        </div>
       
      </div>

      {/* ── Charts ── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header py-3">
              <h6 className="fw-semibold mb-0">Students per Class</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.byClass || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header py-3">
              <h6 className="fw-semibold mb-0">Gender Distribution</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}