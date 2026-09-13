export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#040c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#22d3ee', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading Properties…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
