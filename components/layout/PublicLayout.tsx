import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/layout/Footer';
import EmergencyNumbers from '@/components/public/EmergencyNumbers';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020d1a 0%, #041424 60%, #030f1e 100%)',
      }}
    >
      <Navbar />
      <main
        style={{
          flex: 1,
          padding: '40px 24px',
          background:
            'radial-gradient(ellipse at 15% 0%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(99,102,241,0.05) 0%, transparent 50%)',
        }}
      >
        <div className="mx-auto max-w-6xl">
          {children}
          
          <div className="mt-20 border-t border-white/5 pt-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Emergency Resources</h3>
            <EmergencyNumbers />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
