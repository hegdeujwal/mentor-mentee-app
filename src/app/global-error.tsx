"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#faf0ca", color: "#0d3b66", fontFamily: "system-ui, sans-serif", padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>Please try again.</p>
        <button onClick={reset} style={{ background: "#0d3b66", color: "#faf0ca", padding: "8px 16px", borderRadius: 8 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
