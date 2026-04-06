'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus('error');
        setErrorMessage(payload.error ?? 'No se pudo iniciar sesión.');
        return;
      }

      const from = new URLSearchParams(window.location.search).get('from') || '/admin';
      router.push(from);
      router.refresh();
    } catch {
      setStatus('error');
      setErrorMessage('Error de red. Intenta de nuevo.');
    }
  }

  return (
    <main className="main-content" style={{ maxWidth: '520px', minHeight: '70vh', display: 'grid', alignItems: 'center' }}>
      <section className="glass" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>Acceso de administración</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Inicia sesión para gestionar inventario, biografía y carga de obras.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Usuario</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-main)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-main)',
              }}
            />
          </label>

          <button type="submit" className="btn-premium" disabled={status === 'loading'}>
            {status === 'loading' ? 'Validando...' : 'Entrar'}
          </button>

          {status === 'error' && (
            <p style={{ color: '#CC0000', fontWeight: 600 }}>{errorMessage}</p>
          )}
        </form>
      </section>
    </main>
  );
}
