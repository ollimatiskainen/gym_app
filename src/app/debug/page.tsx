'use client';

import { useAuth } from '@/context/AuthContext';

export default function DebugPage() {
  const config = {
    API_KEY: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_GYM_API_KEY),
    AUTH_DOMAIN: !!(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_GYM_AUTH_DOMAIN),
    PROJECT_ID: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_GYM_PROJECT_ID),
    STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Firebase Env Debug</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(config).map(([key, isSet]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            borderRadius: '8px',
            border: `2px solid ${isSet ? '#10b981' : '#ef4444'}`,
            background: isSet ? '#f0fdf4' : '#fef2f2',
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 'bold' }}>{key}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: isSet ? '#10b981' : '#ef4444' }}>
              {isSet ? '✅ FOUND' : '❌ MISSING'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Vercel Tips:</h2>
        <ul style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          <li>Ensure the keys in Vercel start with <strong>NEXT_PUBLIC_</strong></li>
          <li>Check for trailing spaces in the Vercel dashboard.</li>
          <li>Ensure the variables are assigned to the <strong>Production</strong> environment.</li>
          <li>Try deleting and re-adding them if they still show as missing.</li>
        </ul>
      </div>
      
      <button 
        onClick={() => window.location.href = '/login'}
        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Go to Login
      </button>
    </div>
  );
}
