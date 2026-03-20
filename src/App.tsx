import { AuthPanel } from './auth/ui/AuthPanel';

export function App() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6 mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold underline">User Management</h1>
      <p className="mt-2 text-zinc-700">
        Auth + friend invites + conversion tracking (mock).
      </p>
      <div className="mt-6">
        <AuthPanel />
      </div>
    </div>
  );
}
