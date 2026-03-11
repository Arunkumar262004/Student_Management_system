import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { auditAPI } from '../services/api'

const ACTION_BADGE = {
  CREATE: 'badge-create',
  UPDATE: 'badge-update',
  DELETE: 'badge-delete',
  IMPORT: 'badge-import',
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, action, search }],
    queryFn: () => auditAPI.getAll({ page, limit: 20, action, search }).then((r) => r.data),
  })

  useEffect(() => {
    document.title = "Logs Page";
  }, []);
  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const totalPages = data?.pagination?.totalPages || 1

  return (
    <div>
      <h1 className="fw-bold mb-1">Audit Logs</h1>
      <p className="text-muted small mb-4">All add, edit, and delete actions are recorded here</p>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-3">
          <form onSubmit={handleSearch} className="row g-2 align-items-end">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted" />
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="form-control"
                  placeholder="Search by user or student name..."
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select
                value={action}
                onChange={(e) => { setAction(e.target.value); setPage(1) }}
                className="form-select form-select-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="IMPORT">Import</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <button type="submit" className="btn btn-primary btn-sm w-100">
                <i className="bi bi-search me-1" /> Search
              </button>
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
                <th>Action</th>
                <th>Performed By</th>
                <th>Student</th>
                <th>Timestamp</th>
                <th>IP Address</th>
                <th className="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Loading...
                  </td>
                </tr>
              ) : data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <i className="bi bi-journal-x fs-3 d-block mb-2" />
                    No audit logs found
                  </td>
                </tr>
              ) : (
                data?.logs?.map((log) => (
                  <>
                    {/* Log row */}
                    <tr key={log.id}>
                      <td>
                        <span className={`badge rounded-pill ${ACTION_BADGE[log.action] || 'badge-inactive'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div className="fw-medium" style={{ fontSize: 14 }}>{log.userName}</div>
                        <div className="text-muted text-capitalize" style={{ fontSize: 12 }}>{log.userRole}</div>
                      </td>
                      <td style={{ fontSize: 14 }}>{log.entityName || '—'}</td>
                      <td className="text-muted" style={{ fontSize: 12 }}>
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="font-monospace text-muted" style={{ fontSize: 12 }}>
                        {log.ipAddress || '—'}
                      </td>
                      <td className="text-end">
                        {log.changes && (
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                            style={{ fontSize: 12 }}
                          >
                            {expandedId === log.id ? 'Hide' : 'View'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded JSON */}
                    {expandedId === log.id && log.changes && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={6} className="pb-3 pt-0">
                          <pre className="audit-json">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex align-items-center justify-content-between py-3">
            <span className="text-muted small">
              {data?.pagination?.total} total entries
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">Page {page} of {totalPages}</span>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

      </div>
    </div>
  )
}