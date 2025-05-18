export default function Debug() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Debug Page</h1>
      <p>If you can see this, the Next.js server is working!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
} 