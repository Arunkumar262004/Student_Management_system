import { useEffect, useState }    from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm }                from 'react-hook-form'
import toast                      from 'react-hot-toast'

import { studentsAPI } from '../services/api'

const CLASSES = ['Class 1A','Class 1B','Class 2A','Class 2B','Class 3A']

export default function StudentFormPage() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const queryClient = useQueryClient()
  const isEdit      = !!id
  useEffect(() => {
    document.title = "Student Form";
  }, []);
  const [photoPreview, setPhotoPreview] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Load existing student when editing
  const { data: student } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => studentsAPI.getOne(id).then((r) => r.data),
    enabled:  isEdit,
  })

  useEffect(() => {
    if (student) {
      reset({
        firstName:   student.firstName,
        lastName:    student.lastName,
        email:       student.email,
        phone:       student.phone,
        gender:      student.gender,
        className:   student.className,
        rollNumber:  student.rollNumber,
        dateOfBirth: student.dateOfBirth,
        address:     student.address,
        parentName:  student.parentName,
        parentPhone: student.parentPhone,
        status:      student.status,
      })
      if (student.photo) setPhotoPreview(student.photo)
    }
  }, [student, reset])

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEdit ? studentsAPI.update(id, formData) : studentsAPI.create(formData),
    onSuccess: () => {
      toast.success(isEdit ? 'Student updated!' : 'Student created!')
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard'])
      navigate('/students')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  })

  const onSubmit = (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photo') {
        if (value[0]) formData.append('photo', value[0])
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value)
      }
    })
    saveMutation.mutate(formData)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <h1 className="fw-bold mb-0">{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
          <p className="text-muted small mb-0">
            {isEdit ? 'Update student details' : 'Fill in the details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Photo upload ── */}
        <div className="card mb-3">
          <div className="card-header py-3">
            <h6 className="fw-semibold mb-0">Profile Photo</h6>
          </div>
          <div className="card-body d-flex align-items-center gap-4">
            <div className="photo-box">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className="bi bi-person fs-2 text-muted" />
              )}
            </div>
            <div>
              <label className="btn btn-outline-secondary btn-sm mb-1" style={{ cursor: 'pointer' }}>
                <i className="bi bi-upload me-1" /> Upload Photo
                <input
                  {...register('photo')}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={(e) => { register('photo').onChange(e); handlePhotoChange(e) }}
                />
              </label>
              <p className="text-muted small mb-0">JPEG, PNG, WebP — max 5MB</p>
            </div>
          </div>
        </div>

        {/* ── Basic info ── */}
        <div className="card mb-3">
          <div className="card-header py-3">
            <h6 className="fw-semibold mb-0">Basic Information</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                <input
                  {...register('firstName', { required: 'Required' })}
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  placeholder="Arun "
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Last Name <span className="text-danger">*</span></label>
                <input
                  {...register('lastName', { required: 'Required' })}
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  placeholder="Kumar"
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                <input
                  {...register('email', {
                    required: 'Required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="arun@gmail.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input
                  {...register('phone')}
                  className="form-control"
                  placeholder="+91 95787 77764"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
                <select
                  {...register('gender', { required: 'Required' })}
                  className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender.message}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input {...register('dateOfBirth')} type="date" className="form-control" />
              </div>

            </div>
          </div>
        </div>

        {/* ── Academic info ── */}
        <div className="card mb-3">
          <div className="card-header py-3">
            <h6 className="fw-semibold mb-0">Academic Information</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Class <span className="text-danger">*</span></label>
                <select
                  {...register('className', { required: 'Required' })}
                  className={`form-select ${errors.className ? 'is-invalid' : ''}`}
                >
                  <option value="">Select class</option>
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.className && <div className="invalid-feedback">{errors.className.message}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Roll Number</label>
                <input {...register('rollNumber')} className="form-control" placeholder="1A-001" />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Status</label>
                <select {...register('status')} className="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ── Parent info ── */}
        <div className="card mb-4">
          <div className="card-header py-3">
            <h6 className="fw-semibold mb-0">Parent / Guardian</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Parent Name</label>
                <input {...register('parentName')} className="form-control" placeholder="Mr. Ravi" />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Parent Phone</label>
                <input {...register('parentPhone')} className="form-control" placeholder="+91 93455 15431" />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Address</label>
                <textarea
                  {...register('address')}
                  className="form-control"
                  rows={3}
                  placeholder="#2 Bharathiyar Street Tiruppur"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4">
            Cancel
          </button>
          <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary px-4">
            <i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-1`} />
            {saveMutation.isPending
              ? 'Saving...'
              : isEdit ? 'Update Student' : 'Create Student'}
          </button>
        </div>

      </form>
    </div>
  )
}