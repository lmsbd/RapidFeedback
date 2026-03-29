import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'antd';
import userStore from '@/stores/userStore';
import AuthModal from '@/components/AuthModal';

const AuthGuard = observer(({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  console.log('AuthGuard - userStore.isLoggedIn:', userStore.isLoggedIn);
  console.log('AuthGuard - userStore.token:', userStore.token);

  // If user is not logged in, show login modal
  if (!userStore.isLoggedIn) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <h1 style={{ marginBottom: '20px', fontSize: '28px' }}>
            Welcome to RapidFeedback
          </h1>
          <p style={{ marginBottom: '30px', fontSize: '16px', opacity: 0.9 }}>
            Please login to continue using the system
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login Now
          </button>
        </div>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // User is logged in, show application content
  return children;
});

export default AuthGuard;
