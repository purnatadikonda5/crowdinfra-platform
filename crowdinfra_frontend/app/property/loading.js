export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0a00', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#fbbf24', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
