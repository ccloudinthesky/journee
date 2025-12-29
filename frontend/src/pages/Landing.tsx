import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, loading } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    // If already authenticated, redirect to home
    // Only redirect if we're not in the middle of a login attempt
    if (isAuthenticated && !isLoading) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Fade in animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async () => {
    // Clear previous errors
    setError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error: any) {
      console.error(isLoginMode ? 'Login failed:' : 'Registration failed:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowLoginForm = () => {
    setShowLoginForm(true);
  };

  const handleBackToWelcome = () => {
    setShowLoginForm(false);
    setIsLoginMode(true);
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateUsername = (username: string) => {
    if (!isLoginMode && !username) {
      setUsernameError('Username is required');
      return false;
    }
    if (!isLoginMode && username.length < 2) {
      setUsernameError('Username must be at least 2 characters');
      return false;
    }
    if (!isLoginMode && username.length > 50) {
      setUsernameError('Username must be less than 50 characters');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>
        {`
          @keyframes typewriter {
            from { width: 0; }
            to { width: 100%; }
          }
        `}
      </style>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1547093349-65cdba98369a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Decorative Line */}
        <svg
          className="absolute left-0 bottom-1/4 w-full h-64 opacity-30"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 Q300,20 600,100 T1200,100"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
        </svg>

        {/* Main Content */}
        <div className="text-center text-white max-w-3xl">
          <h1 
            className={`text-7xl md:text-8xl font-light tracking-wide mb-4 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              fontFamily: 'Crimson Text, serif',
              transform: isVisible ? 'translateY(-8px)' : 'translateY(4px)'
            }}
          >
            Journee
          </h1>
          
          <p 
            className={`text-xl md:text-2xl mb-12 transition-all duration-1000 ease-out delay-300 ${
              isVisible ? 'opacity-90' : 'opacity-0'
            }`}
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 300,
              transform: isVisible ? 'translateY(-8px)' : 'translateY(4px)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              animation: isVisible ? 'typewriter 2s steps(40) 0.3s forwards' : 'none'
            }}
          >
            "Turn your travel ideas into stories."
          </p>

          {!showLoginForm ? (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setShowLoginForm(true);
                }}
                className="px-8 py-3 border border-white rounded-full text-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                style={{
                  borderRadius: '32px',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '20px'
                }}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setShowLoginForm(true);
                }}
                className="px-8 py-3 border border-white rounded-full text-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                style={{
                  borderRadius: '32px',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '20px'
                }}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-6 relative z-20">
              {/* Login/Sign Up Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                onKeyDown={handleKeyDown}
                className="space-y-4 max-w-sm mx-auto relative z-20"
              >
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLoginMode 
                        ? 'bg-white text-gray-900' 
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    Login
                  </button>
          <button
                    onClick={() => setIsLoginMode(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !isLoginMode 
                        ? 'bg-white text-gray-900' 
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    Sign Up
          </button>
        </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-300 text-sm text-center mb-2">
                    {error}
                  </div>
                )}

                {/* Username field for Sign Up */}
                {!isLoginMode && (
                  <div>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value) validateUsername(e.target.value);
                      }}
                      onBlur={() => validateUsername(username)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all cursor-text relative z-20 ${
                        usernameError ? 'border-red-400' : 'border-white/30 focus:border-white'
                      }`}
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '16px',
                        fontWeight: 400
                      }}
                    />
                    {usernameError && (
                      <p className="text-red-300 text-xs mt-1">{usernameError}</p>
                    )}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all cursor-text relative z-20 ${
                      emailError ? 'border-red-400' : 'border-white/30 focus:border-white'
                    }`}
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '16px',
                      fontWeight: 400
                    }}
                  />
                  {emailError && (
                    <p className="text-red-300 text-xs mt-1">{emailError}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) validatePassword(e.target.value);
                    }}
                    onBlur={() => validatePassword(password)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all cursor-text relative z-20 ${
                      passwordError ? 'border-red-400' : 'border-white/30 focus:border-white'
                    }`}
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '16px',
                      fontWeight: 400
                    }}
                  />
                  {passwordError && (
                    <p className="text-red-300 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full px-12 py-4 border border-white rounded-full text-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 cursor-pointer relative z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderRadius: '32px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '20px',
                    backgroundColor: '#e1dbc7',
                    color: '#3A3A3A',
                    borderColor: '#e1dbc7'
                  }}
                >
                  {isLoading ? 'Loading...' : (isLoginMode ? 'Login' : 'Sign Up')}
                </button>

                {/* Back Button */}
                <button
                  onClick={handleBackToWelcome}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer relative z-30 mt-2"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  ← back
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Landing;

