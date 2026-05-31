import PoliceSidebar from '@/components/navigation/PoliceSidebar';
import CitizenSidebar from '@/components/navigation/CitizenSidebar';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isPolice = session?.role === 'POLICE' || session?.role === 'ADMIN';

  return (
    <div className='flex bg-[#020d1a]'>
      {isPolice ? (
        <PoliceSidebar userName={session?.name} />
      ) : (
        <CitizenSidebar userName={session?.name} />
      )}
      <main className='min-h-screen flex-1 p-6 overflow-y-auto'>
        {children}
      </main>
    </div>
  );
}
