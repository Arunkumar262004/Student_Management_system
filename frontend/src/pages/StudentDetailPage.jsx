import { useNavigate, useParams } from 'react-router-dom'
import { useQuery }               from '@tanstack/react-query'
import { useSelector }            from 'react-redux'
import { format }                 from 'date-fns'

import { studentsAPI }       from '../services/api'
import { selectCurrentUser } from '../store/authSlice'
import { useEffect } from 'react'

const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-start gap-3 mb-3">
    <div
      className="d-flex align-items-center justify-content-center rounded-3 bg-light text-muted flex-shrink-0"
      style={{ width: 34, height: 34 }}
    >
      <i className={`bi ${icon}`} style={{ fontSize: 14 }} />
    </div>
    <div>
      <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
      <div className="fw-medium" style={{ fontSize: 14 }}>{value || '—'}</div>
    </div>
  </div>
)

export default function StudentDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const isAdmin     = currentUser?.role === 'admin'

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => studentsAPI.getOne(id).then((r) => r.data),
  })
  useEffect(() => {
    document.title = "Studen Detail";
  }, []);
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
        <div className="spinner-border text-primary" />
      </div>
    )
  }

  if (!student) {
    return <div className="text-center text-muted py-5">Student not found.</div>
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left" />
        </button>
        <h1 className="fw-bold mb-0 flex-grow-1">Student Profile</h1>
        {isAdmin && (
          <button
            onClick={() => navigate(`/students/${id}/edit`)}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-pencil" /> Edit
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="card mb-3">
        <div className="card-body d-flex align-items-start gap-4 flex-wrap p-4">

          {/* Avatar / Photo */}
          {student.photo ? (
            <img
              src={student.photo}
              alt=""
              style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
            />
          ) : (
            <div
              className="avatar-lg avatar"
              style={{ borderRadius: 12 }}
            >
              {student.firstName[0]}{student.lastName[0]}
            </div>
          )}

          {/* Info */}
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-1">{student.firstName} {student.lastName}</h4>
            <p className="text-muted small mb-2">{student.email}</p>
            <div className="d-flex flex-wrap gap-2">
              <span className={`badge rounded-pill badge-${student.status}`}>{student.status}</span>
              <span className={`badge rounded-pill badge-${student.gender}`}>{student.gender}</span>
              <span className="badge rounded-pill" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                {student.className}
              </span>
            </div>
          </div>

          {/* Roll number */}
          {student.rollNumber && (
            <div className="text-end">
              <div className="text-muted" style={{ fontSize: 11 }}>Roll Number</div>
              <div className="fw-bold font-monospace fs-5">{student.rollNumber}</div>
            </div>
          )}

        </div>
      </div>

      {/* Detail sections */}
      <div className="row g-3">

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header py-3">
              <h6 className="fw-semibold mb-0">Personal Information</h6>
            </div>
            <div className="card-body pt-3">
              <InfoRow icon="bi-envelope"     label="Email"         value={student.email} />
              <InfoRow icon="bi-phone"        label="Phone"         value={student.phone} />
              <InfoRow icon="bi-calendar"     label="Date of Birth" value={student.dateOfBirth ? format(new Date(student.dateOfBirth), 'MMMM dd, yyyy') : null} />
              <InfoRow icon="bi-geo-alt"      label="Address"       value={student.address} />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header py-3">
              <h6 className="fw-semibold mb-0">Academic & Family</h6>
            </div>
            <div className="card-body pt-3">
              <InfoRow icon="bi-book"         label="Class"        value={student.className} />
              <InfoRow icon="bi-person"       label="Parent Name"  value={student.parentName} />
              <InfoRow icon="bi-phone"        label="Parent Phone" value={student.parentPhone} />
              <InfoRow icon="bi-calendar-check" label="Enrolled On" value={format(new Date(student.createdAt), 'MMMM dd, yyyy')} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}