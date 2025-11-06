import React, { useState } from 'react'

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Dummy authentication - any data works
    onLogin({
      id: 1,
      name: formData.name || 'User',
      email: formData.email || 'user@example.com'
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          <p className="text-center mt-20">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a 
              href="#" 
              onClick={() => setIsLogin(!isLogin)}
              style={{color: '#667eea', textDecoration: 'none'}}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Auth