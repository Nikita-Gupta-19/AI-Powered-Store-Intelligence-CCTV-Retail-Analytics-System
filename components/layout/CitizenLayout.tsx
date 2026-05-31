import CitizenSidebar from '@/components/navigation/CitizenSidebar';
import { getSession } from '@/lib/auth';

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020d1a 0%, #041424 60%, #030f1e 100%)',
      }}
    >
      <CitizenSidebar userName={session?.name} />
      <main
        style={{
          flex: 1,
          padding: '28px 32px',
          minHeight: '100vh',
          overflowY: 'auto',
          background:
            'radial-gradient(ellipse at 15% 0%, rgba(6,182,212,0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(99,102,241,0.03) 0%, transparent 50%)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
