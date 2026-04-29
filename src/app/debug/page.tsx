'use client';

export default function DebugPage() {
  const getVal = (v: string | undefined) => {
    if (!v) return '❌ MISSING';
    if (v.length < 2) return `✅ FOUND (Length: ${v.length})`;
    return `✅ FOUND: ${v.charAt(0)}...${v.charAt(v.length - 1)} (Length: ${v.length})`;
  };

  const config = {
    API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_GYM_API_KEY,
    AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_GYM_AUTH_DOMAIN,
    PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_GYM_PROJECT_ID,
    STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#000', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Detailed Env Debug</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            borderRadius: '8px',
            border: `2px solid ${value ? '#10b981' : '#ef4444'}`,
            background: value ? '#f0fdf4' : '#fef2f2',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <span style={{ fontWeight: 'bold' }}>{key}</span>
            <span style={{ fontSize: '1.2rem' }}>{getVal(value)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Vercel Check:</h2>
        <p>Ensure these are NOT marked as "Sensitive" or "Secret" in Vercel. They MUST be Plaintext.</p>
      </div>
    </div>
  );
}
