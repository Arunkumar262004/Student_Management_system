import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { setCredentials } from '../store/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  useEffect(() => {
    document.title = "Login";
  }, []);
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authAPI.login(data),
    onSuccess: (res) => {
      dispatch(setCredentials(res.data))
      toast.success('Welcome back!')
      navigate('/dashboard')
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Invalid email or password'
      toast.error(message)
    },
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .ap {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
        }

        .ap-left {
          width: 400px;
          min-width: 400px;
          padding: 3rem;
          background: linear-gradient(160deg, #1e40af, #3b0764);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .ap-left::before,
        .ap-left::after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }

        .ap-left::before {
          width: 280px;
          height: 280px;
          background: rgba(255, 255, 255, .06);
          top: -80px;
          right: -80px;
        }

        .ap-left::after {
          width: 220px;
          height: 220px;
          background: rgba(255, 255, 255, .04);
          bottom: -60px;
          left: -60px;
        }

        .ap-logo {
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
        }

        .ap-logo span {
          color: #93c5fd;
        }

        .ap-quote {
          font-size: 1.5rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.45;
        }

        .ap-quote b {
          color: #93c5fd;
          font-weight: 600;
        }

        .ap-dots {
          display: flex;
          gap: .5rem;
        }

        .ap-dots i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, .3);
          display: block;
        }

        .ap-dots i:first-child {
          width: 22px;
          border-radius: 4px;
          background: #fff;
        }

        .ap-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 2rem;
        }

        .ap-box {
          width: 100%;
          max-width: 370px;
        }

        .ap-box h2 {
          font-size: 1.55rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -.03em;
          margin-bottom: .25rem;
        }

        .ap-box .sub {
          color: #94a3b8;
          font-size: .85rem;
          margin-bottom: 1.75rem;
        }

        .fl {
          font-size: .7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .07em;
          color: #64748b;
          margin-bottom: .35rem;
        }

        .fi {
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 10px !important;
          padding: .68rem 1rem !important;
          font-size: .88rem !important;
          background: #fff !important;
          color: #0f172a !important;
          transition: border-color .2s, box-shadow .2s !important;
        }

        .fi:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, .1) !important;
        }

        .fi.is-invalid {
          border-color: #f87171 !important;
        }

        .fi::placeholder {
          color: #cbd5e1 !important;
        }

        .input-group .fi {
          border-right: none !important;
          border-radius: 10px 0 0 10px !important;
        }

        .tgl {
          border: 1.5px solid #e2e8f0 !important;
          border-left: none !important;
          border-radius: 0 10px 10px 0 !important;
          background: #fff !important;
          color: #94a3b8 !important;
          padding: 0 .9rem !important;
        }

        .tgl:hover {
          color: #3b82f6 !important;
        }

        .invalid-feedback {
          font-size: .72rem;
          color: #f87171;
        }

        .btn-go {
          width: 100%;
          padding: .72rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: .9rem;
          color: #fff;
          background: linear-gradient(135deg, #1e40af, #7c3aed);
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }

        .btn-go:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(30, 64, 175, .25);
        }

        .btn-go:disabled {
          opacity: .5;
        }

        .ap-ft {
          text-align: center;
          font-size: .8rem;
          color: #94a3b8;
          margin-top: 1.5rem;
        }

        .ap-ft a {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .ap-left {
            display: none;
          }

          .ap-right {
            background: #fff;
          }
        }
      `}</style>

      <div className="ap">
        <div className="ap-left">
          <div className="ap-logo"><span></span></div>
          <div>
            <p className="ap-quote">Student Management<br /><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System</b></p>
            
          </div>
          <div className="ap-dots"><i /><i /><i /></div>
        </div>

        <div className="ap-right">
          <div className="ap-box">
            <h2>Welcome back</h2>
            <p className="sub">Sign in to access your dashboard</p>

            <form onSubmit={handleSubmit((d) => mutate(d))}>
              <div className="mb-3">
                <div className="fl">Email</div>
                <input
                  {...register('email', {
                    required: 'Required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="you@school.com"
                  className={`form-control fi ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              <div className="mb-4">
                <div className="fl">Password</div>
                <div className="input-group">
                  <input
                    {...register('password', { required: 'Required' })}
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-control fi ${errors.password ? 'is-invalid' : ''}`}
                  />
                  <button type="button" className="btn tgl" onClick={() => setShow(p => !p)}>
                    <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
              </div>

              <button type="submit" disabled={isPending} className="btn-go">
                {isPending
                  ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                  : 'Sign In →'
                }
              </button>
            </form>

            <p className="ap-ft">No account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}