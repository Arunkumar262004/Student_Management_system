import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token:           localStorage.getItem('token') || null,
    user:            localStorage.getItem('user')
                       ? JSON.parse(localStorage.getItem('user'))
                       : null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token           = action.payload.token
      state.user            = action.payload.user
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user',  JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.token           = null
      state.user            = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser     = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated