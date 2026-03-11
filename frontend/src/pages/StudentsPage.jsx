import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { studentsAPI } from '../services/api'
import { selectCurrentUser } from '../store/authSlice'

const CLASSES = ['Class 1A', 'Class 1B', 'Class 2A', 'Class 2B', 'Class 3A']

export default function StudentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useSelector(selectCurrentUser)
  const isAdmin = currentUser?.role === 'admin'
  useEffect(() => {
    document.title = "Student List";
  }, []);
  // Filter state
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [className, setClassName] = useState('')
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 10

  // Delete modal
  const [deleteId, setDeleteId] = useState(null)

  // Import loading
  const [importing, setImporting] = useState(false)

  const params = { page, limit, search, className, gender, status }

  const { data, isLoading } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsAPI.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => studentsAPI.delete(id),
    onSuccess: () => {
      toast.success('Student deleted')
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard'])
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleFilter = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchInput(''); setSearch('')
    setClassName(''); setGender('')
    setStatus(''); setPage(1)
  }

  const handleExport = async () => {
    try {
      const res = await studentsAPI.exportExcel()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'students.xlsx'
      a.click()
      toast.success('Exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    try {
      const res = await studentsAPI.importExcel(file)
      toast.success(res.data.message)
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard'])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const totalPages = data?.pagination?.totalPages || 1
  const totalStudents = data?.pagination?.total || 0
  const hasFilters = search || className || gender || status

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Students</h1>
          <p className="text-muted small mb-0">{totalStudents} total students</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button onClick={handleExport} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-upload" /> Export
          </button>
          {isAdmin && (
            <>
              <label className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 mb-0" style={{ cursor: 'pointer' }}>
                <i className="bi bi-download" />
                {importing ? 'Importing...' : 'Import'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="d-none"
                  onChange={handleImport}
                  disabled={importing}
                />
              </label>
              <Link to="/students/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                <i className="bi bi-plus-lg" /> Add Student
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="card mb-3">
        <div className="card-body py-3">
          <form onSubmit={handleSearch} className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted" />
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="form-control"
                  placeholder="Search name, email, roll..."
                />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <select value={className} onChange={handleFilter(setClassName)} className="form-select form-select-sm">
                <option value="">All Classes</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select value={gender} onChange={handleFilter(setGender)} className="form-select form-select-sm">
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select value={status} onChange={handleFilter(setStatus)} className="form-select form-select-sm">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-6 col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm flex-grow-1">
                <i className="bi bi-search" /> Search
              </button>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Roll No.</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Loading...
                  </td>
                </tr>
              ) : data?.students?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-2" />
                    No students found
                  </td>
                </tr>
              ) : (
                data?.students?.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt=""
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="avatar">{student.firstName[0]}{student.lastName[0]}</div>
                        )}
                        <div>
                          <div className="fw-medium" style={{ fontSize: 14 }}>
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.className}</td>
                    <td>
                      <span className={`badge rounded-pill badge-${student.gender}`}>
                        {student.gender}
                      </span>
                    </td>
                    <td>
                      <span className="font-monospace" style={{ fontSize: 12 }}>
                        {student.rollNumber || '—'}
                      </span>
                    </td>
                    <td>{student.phone || '—'}</td>
                    <td>
                      <span className={`badge rounded-pill badge-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="action-btn action-btn-view"
                          title="View"
                        >
                          <i className="bi bi-eye" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => navigate(`/students/${student.id}/edit`)}
                              className="action-btn action-btn-edit"
                              title="Edit"
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            <button
                              onClick={() => setDeleteId(student.id)}
                              className="action-btn action-btn-delete"
                              title="Delete"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex align-items-center justify-content-between py-3">
            <span className="text-muted small">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalStudents)} of {totalStudents}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">

                {/* Prev */}
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <li key={num} className="page-item">
                    <button
                      className="page-link"
                      onClick={() => setPage(num)}
                      style={
                        num === page
                          ? { backgroundColor: '#ffffff', borderColor: '#4f46e5', color: '#000000', fontWeight: '600' }
                          : { color: '#ffffff' }
                      }
                    >
                      {num}
                    </button>
                  </li>
                ))}

                {/* Next */}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>

              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{ display: 'flex !important', backgroundColor: 'rgba(0,0,0,0.45)', position: 'fixed', inset: 0, zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered m-0">
            <div className="modal-content rounded-4 shadow-lg p-2">
              <div className="modal-body text-center py-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-3"
                  style={{ width: 56, height: 56, fontSize: 24 }}
                >
                  <i className="bi bi-trash" />
                </div>
                <h5 className="fw-bold mb-2">Delete Student?</h5>
                <p className="text-muted small mb-4">This action cannot be undone.</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button onClick={() => setDeleteId(null)} className="btn btn-outline-secondary px-4">
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteId)}
                    disabled={deleteMutation.isPending}
                    className="btn btn-danger px-4"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}