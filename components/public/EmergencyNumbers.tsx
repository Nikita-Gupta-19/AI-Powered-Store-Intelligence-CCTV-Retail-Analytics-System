import { Phone, Shield, Truck, AlertCircle } from 'lucide-react';

const contacts = [
  { name: 'Police Emergency', number: '112', icon: Shield, color: 'text-blue-400' },
  { name: 'Ambulance', number: '102', icon: Truck, color: 'text-green-400' },
  { name: 'Fire Department', number: '101', icon: AlertCircle, color: 'text-red-400' },
  { name: 'Women Helpline', number: '1091', icon: Phone, color: 'text-purple-400' },
];

export default function EmergencyNumbers() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {contacts.map((c) => (
        <div 
          key={c.name}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className={`p-2 rounded-lg bg-white/5 ${c.color}`}>
            <c.icon size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{c.name}</p>
            <p className="text-lg font-bold text-white">{c.number}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
