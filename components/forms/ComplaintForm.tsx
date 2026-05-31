'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { complaintsService } from '@/services/complaints.service';
import { Button } from '@/components/ui/button';
import MediaUploader from '@/components/upload/MediaUploader';

const LOCATIONS = [
  { name: 'Main Entry/Exit Zone', lat: 28.6139, lng: 77.2090 },
  { name: 'Aisle 1 - Cosmetics & Skincare', lat: 28.6180, lng: 77.2120 },
  { name: 'Aisle 2 - Apparel & Handbags', lat: 28.6210, lng: 77.2050 },
  { name: 'POS Checkout Counters', lat: 28.6080, lng: 77.2020 },
];

export default function StoreSessionForm() {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSelected, setLocationSelected] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'POS_CHECKOUT',
    lat: '',
    lng: '',
    address: '',
    landmark: '',
  });

  const filteredLocations = LOCATIONS.filter(l => l.name.toLowerCase().includes(locationSearch.toLowerCase()));

  const handleLocationSelect = (loc: any) => {
    setLocationSearch(loc.name);
    setForm({ ...form, lat: loc.lat.toString(), lng: loc.lng.toString() });
    setLocationSelected(true);
    setShowSuggestions(false);
    setValidationErrors(prev => ({ ...prev, location: '' }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      errors.title = 'Session title is required (at least 3 characters).';
    if (!form.description.trim() || form.description.trim().length < 10)
      errors.description = 'Description is required (at least 10 characters).';
    if (!locationSelected || !form.lat || !form.lng)
      errors.location = 'Please select a store department from the dropdown.';
    if (!form.address.trim() || form.address.trim().length < 5)
      errors.address = 'Store section coordinates are required.';
    if (mediaUrls.length === 0)
      errors.media = 'You must upload at least one video file as CCTV evidence.';
    return errors;
  };

  const m = useMutation({
    mutationFn: () =>
      complaintsService.create({
        title: form.title,
        description: form.description,
        category: form.category,
        lat: Number(form.lat),
        lng: Number(form.lng),
        address: form.address,
        landmark: form.landmark,
        mediaUrls,
      }),
  });

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (m.isPending) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [m.isPending]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        setValidationErrors({});
        m.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <input
          className={`w-full rounded-xl border px-4 py-3 text-white bg-slate-950 ${
            validationErrors.title ? 'border-red-500' : 'border-slate-700'
          }`}
          placeholder="Session title (e.g. Active Customer Session #92)"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: '' }));
          }}
        />
        {validationErrors.title && <p className="mt-1 text-xs text-red-400">⚠ {validationErrors.title}</p>}
      </div>
      <div>
        <textarea
          className={`w-full rounded-xl border px-4 py-3 text-white bg-slate-950 ${
            validationErrors.description ? 'border-red-500' : 'border-slate-700'
          }`}
          rows={4}
          placeholder="Describe observed activity (required, min 10 characters)"
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }));
          }}
        />
        {validationErrors.description && <p className="mt-1 text-xs text-red-400">⚠ {validationErrors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block pl-1">Store Department</label>
          <select 
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" 
            value={form.category} 
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="POS_CHECKOUT">POS Transaction</option>
            <option value="SHELF_INTERACTION">Shelf Browsing</option>
            <option value="QUEUE_WAIT">Checkout Queue Wait</option>
            <option value="FOOTFALL_ENTRY">Store Entry</option>
            <option value="ANOMALY_SPILL">Hazardous Spill Anomaly</option>
            <option value="ANOMALY_THEFT">Suspicious Shoplifting</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="text-xs text-slate-400 font-medium mb-1 block pl-1">Location Zone</label>
          <input 
            className={`w-full rounded-xl border px-4 py-3 text-white bg-slate-950 ${
              validationErrors.location ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder="Search store zone (e.g. Aisle 1)" 
            value={locationSearch} 
            onChange={(e) => {
              setLocationSearch(e.target.value);
              setLocationSelected(false);
              setShowSuggestions(true);
              if (validationErrors.location) setValidationErrors(prev => ({ ...prev, location: '' }));
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && locationSearch.length > 0 && filteredLocations.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 shadow-lg max-h-48 overflow-y-auto">
              {filteredLocations.map(loc => (
                <div 
                  key={loc.name} 
                  className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-slate-200"
                  onClick={() => handleLocationSelect(loc)}
                >
                  {loc.name}
                </div>
              ))}
            </div>
          )}
          {validationErrors.location && <p className="mt-1 text-xs text-red-400">⚠ {validationErrors.location}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-slate-500 mb-1 block pl-1">Grid X coordinate</span>
          <input className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-400 cursor-not-allowed" readOnly value={form.lat} />
        </div>
        <div>
          <span className="text-xs text-slate-500 mb-1 block pl-1">Grid Y coordinate</span>
          <input className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-400 cursor-not-allowed" readOnly value={form.lng} />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block pl-1">
          Store Section Coordinates <span className="text-red-400">*</span>
        </label>
        <input
          className={`w-full rounded-xl border px-4 py-3 text-white bg-slate-950 ${
            validationErrors.address ? 'border-red-500' : 'border-slate-700'
          }`}
          placeholder="e.g. Row 3, Rack A, Ground Floor"
          value={form.address}
          onChange={(e) => {
            setForm({ ...form, address: e.target.value });
            if (validationErrors.address) setValidationErrors(prev => ({ ...prev, address: '' }));
          }}
        />
        {validationErrors.address && (
          <p className="mt-1 text-xs text-red-400">⚠ {validationErrors.address}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block pl-1">
          Camera ID / Angle Reference <span className="text-slate-600">(optional)</span>
        </label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600"
          placeholder="e.g. CCTV-CAM-03, Wide Entrance Angle"
          value={form.landmark}
          onChange={(e) => setForm({ ...form, landmark: e.target.value })}
        />
      </div>
      
      <div>
        <MediaUploader onUploaded={(urls) => {
          setMediaUrls(urls);
          if (urls.length > 0 && validationErrors.media) {
            setValidationErrors(prev => ({ ...prev, media: '' }));
          }
        }} />
        {validationErrors.media && (
          <p className="mt-2 text-xs text-red-400">⚠ {validationErrors.media}</p>
        )}
      </div>
      
      <Button disabled={m.isPending}>
        {m.isPending ? `Analyzing CCTV feed with AI… ${elapsed}s` : 'Submit CCTV Feed'}
      </Button>

      {m.isPending && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
          <p className="text-xs text-cyan-400 font-medium">⏳ AI is processing your CCTV video evidence — this can take up to 90 seconds.</p>
          <p className="text-[10px] text-slate-500 mt-1">Do not close this page. You'll be notified when the analysis is complete.</p>
          <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((elapsed / 90) * 100, 98)}%` }}
            />
          </div>
        </div>
      )}
      {m.isSuccess && <p className="text-green-300">✅ Session analysis submitted. YOLO + tracking analytics stored.</p>}
      {m.isError && <p className="text-red-300">❌ CCTV analysis failed. Please verify that the python AI service is running.</p>}
    </form>
  );
}
