import PoliceSidebar from '@/components/navigation/PoliceSidebar';
import { getSession } from '@/lib/auth';

export default async function PoliceLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080c12 0%, #0d1117 60%, #0a0e16 100%)',
      }}
    >
      <PoliceSidebar userName={session?.name} />
      <main
        style={{
          flex: 1,
          padding: '28px 32px',
          minHeight: '100vh',
          overflowY: 'auto',
          background:
            'radial-gradient(ellipse at 10% 0%, rgba(220,38,38,0.04) 0%, transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(234,88,12,0.03) 0%, transparent 50%)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
