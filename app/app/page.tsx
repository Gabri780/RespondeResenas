'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components ---

const StarRating = ({ rating, setRating, hoverRating, setHoverRating }: any) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-all active:scale-90 hover:scale-110"
        >
          <svg
            className={`w-10 h-10 ${
              (hoverRating || rating) >= star ? 'text-brand-primary' : 'text-white/10'
            } transition-colors duration-300 filter drop-shadow-[0_0_8px_rgba(197,160,89,0.1)]`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const BusinessTypeSelector = ({ selected, onSelect }: any) => {
  const types = [
    { id: 'bar', label: 'Bar/Cafetería', icon: '☕' },
    { id: 'restaurante', label: 'Restaurante', icon: '🍽' },
    { id: 'hotel', label: 'Hotel/Alojamiento', icon: '🏨' },
    { id: 'peluqueria', label: 'Peluquería/Estética', icon: '✂️' },
    { id: 'tienda', label: 'Tienda/Comercio', icon: '🛍' },
    { id: 'clinica', label: 'Clínica/Salud', icon: '🏥' },
    { id: 'taller', label: 'Taller/Reparaciones', icon: '🔧' },
    { id: 'otro', label: 'Otro', icon: '🏢' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onSelect(type.id)}
          className={`px-5 py-3 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] tracking-widest uppercase ${
            selected === type.id
              ? 'bg-white text-black border-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
          }`}
        >
          <span className="opacity-80">{type.icon}</span>
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
};

const LanguageSelector = ({ selected, onSelect }: any) => {
  const languages = ['Español', 'English', 'Français', 'Deutsch'];
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map(lang => (
        <button
          key={lang}
          type="button"
          onClick={() => onSelect(lang)}
          className={`px-5 py-3 rounded-full border text-xs font-bold transition-all tracking-widest uppercase ${
            selected === lang
              ? 'bg-white text-black border-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

const ToneSelector = ({ selected, onSelect }: any) => {
  const tones = [
    { id: 'profesional', label: 'Profesional', icon: '👔', desc: 'Formal y cercano' },
    { id: 'cercano', label: 'Cercano', icon: '🤗', desc: 'Como habla el dueño' },
    { id: 'humor', label: 'Con humor', icon: '😄', desc: 'Simpático y memorable' },
    { id: 'custom', label: 'Personalizada', icon: '✍️', desc: 'Dile a la IA qué decir' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tones.map((tone) => (
        <button
          key={tone.id}
          type="button"
          onClick={() => onSelect(tone.id)}
          className={`flex flex-col items-center p-6 rounded-[2rem] border transition-all min-h-[140px] text-center ${
            selected === tone.id
              ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/10'
          }`}
        >
          <span className="text-3xl mb-3 opacity-90">{tone.icon}</span>
          <span className="font-bold text-sm tracking-tight mb-1">{tone.label}</span>
          <span className={`text-[10px] leading-tight font-medium uppercase tracking-widest ${selected === tone.id ? 'text-black/60' : 'text-white/40'}`}>
            {tone.desc}
          </span>
        </button>
      ))}
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-border-color rounded-3xl p-6 md:p-8 h-48 space-y-4 animate-pulse shadow-sm">
          <div className="h-4 bg-border-color rounded-full w-24"></div>
          <div className="space-y-3 pt-2">
            <div className="h-3 bg-border-color/60 rounded-full w-full"></div>
            <div className="h-3 bg-border-color/60 rounded-full w-[95%]"></div>
            <div className="h-3 bg-border-color/60 rounded-full w-[80%]"></div>
          </div>
          <div className="pt-4">
            <div className="h-10 bg-border-color/40 rounded-xl w-28"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Page Component ---

function PageContent() {
  const searchParams = useSearchParams();
  
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [businessType, setBusinessType] = useState('');
  const [tone, setTone] = useState('profesional');
  const [businessName, setBusinessName] = useState('');
  const [language, setLanguage] = useState('Español');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedResponse, setEditedResponse] = useState<string>('');

  const [refiningId, setRefiningId] = useState<number | null>(null);
  const [refineText, setRefineText] = useState<string>('');
  const [isRefining, setIsRefining] = useState(false);

  const [proEmail, setProEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [proInputEmail, setProInputEmail] = useState('');
  const [proVerifyError, setProVerifyError] = useState('');

  useEffect(() => {
    const savedProEmail = localStorage.getItem('respondeProEmail');
    if (savedProEmail) {
      setProEmail(savedProEmail);
      verifyPro(savedProEmail);
    }
  }, []);

  const verifyPro = async (email: string) => {
    try {
      const res = await fetch('/api/verify-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.isPro) {
        setIsPro(true);
        setProEmail(email);
        localStorage.setItem('respondeProEmail', email);
        setShowProModal(false);
      } else {
        setIsPro(false);
        if (email === proInputEmail) setProVerifyError('Este email no tiene una suscripción Pro activa.');
      }
    } catch (e) {
      console.error('Error verifying pro:', e);
    }
  };

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleStripeCheckout = async (emailToUse?: string) => {
    const targetEmail = emailToUse || proInputEmail || "";
    if (!targetEmail) {
      setProVerifyError('Introduce un email para continuar.');
      return;
    }

    setProVerifyError('');
    setIsCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setProVerifyError(data.error || 'Error al iniciar el checkout.');
      }
    } catch (e) {
      console.error('Error in checkout:', e);
      setProVerifyError('Error al conectar con el servidor.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('respondeHistory');
    if (saved) {
      try {
        setHistoryItems(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          setUsageCount(data.count || 0);
        }
      } catch (e) {
        console.error('Error fetching usage:', e);
      }
    };
    fetchUsage();
  }, []);

  useEffect(() => {
    const r = searchParams.get('review');
    const s = searchParams.get('stars');
    if (r) setReviewText(r);
    if (s) setRating(parseInt(s));
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!reviewText.trim() || rating === 0 || !businessType) {
      setError('Por favor, rellena todos los campos (reseña, estrellas y tipo de negocio).');
      return;
    }

    if (!isPro && usageCount >= 2) {
      setError('Has alcanzado el límite de 2 respuestas de prueba gratuitas.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setShowResults(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: reviewText,
          stars: rating,
          businessType,
          tone,
          businessName,
          language,
          proEmail,
          customInstructions: tone === 'custom' ? customInstructions : ''
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ha ocurrido un error al generar las respuestas.');
      }

      setResponses(data.responses);
      if (data.usageCount !== undefined) {
        setUsageCount(data.usageCount);
      }
      setShowResults(true);

      const generationData = {
        date: new Date().toISOString(),
        review: reviewText.substring(0, 100) + (reviewText.length > 100 ? '...' : ''),
        stars: rating,
        responses: data.responses
      };
      const newHistory = [generationData, ...historyItems].slice(0, 20);
      setHistoryItems(newHistory);
      localStorage.setItem('respondeHistory', JSON.stringify(newHistory));
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('La IA está tardando más de lo normal. Inténtalo de nuevo.');
      } else {
        setError(err.message || 'Error en la conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (id: number) => {
    if (!refineText.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: reviewText,
          currentResponse: responses[id],
          instruction: refineText,
          proEmail
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al refinar');

      const newResponses = [...responses];
      newResponses[id] = data.newResponse;
      setResponses(newResponses);
      setRefiningId(null);
      setRefineText('');
    } catch (err: any) {
      alert(err.message || 'No se ha podido aplicar el cambio.');
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getToneColor = (t: string) => {
    switch (t) {
      case 'profesional': return 'bg-white/5';
      case 'cercano': return 'bg-white/5';
      case 'humor': return 'bg-white/5';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border-color">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full border border-brand-primary flex items-center justify-center text-brand-primary font-outfit text-lg font-bold transition-all group-hover:scale-110 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              P
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight hidden sm:block">RespondePro</span>
          </Link>
          <div className="flex items-center gap-6">
            {!isPro && (
              <button 
                onClick={() => setShowProModal(true)}
                className="text-[10px] font-black text-brand-primary hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                ¿Ya eres Pro?
              </button>
            )}
            {isPro && (
              <div className="flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Plan Pro</span>
              </div>
            )}
            <button onClick={() => setShowHistory(true)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors">Historial</button>
            <Link href="/pricing" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors">Precios</Link>
            {!isPro && (
              <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${usageCount >= 2 ? 'bg-red-500' : 'bg-brand-primary'}`}></span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{Math.max(0, 2 - usageCount)}/2 Usos</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-12 pb-32">
        <div className="minimal-glass rounded-[2.5rem] p-8 md:p-12 mb-20">
          <div className="space-y-12">
            {/* Business Name Input */}
            <div>
              <label className="block text-[10px] font-black mb-4 text-white/40 uppercase tracking-[0.2em]">Nombre de tu negocio (opcional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Bar El Rincón"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:bg-white/10 focus:border-brand-primary/50 outline-none transition-all text-white text-lg font-medium placeholder:text-white/20"
              />
            </div>

            {/* Review Input */}
            <div>
              <label className="block text-[10px] font-black mb-4 text-white/40 uppercase tracking-[0.2em]">Pega aquí la reseña de Google</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Pega el texto aquí..."
                className="w-full h-48 bg-white/5 border border-white/10 p-6 rounded-2xl focus:bg-white/10 focus:border-brand-primary/50 outline-none transition-all resize-none text-white text-lg font-medium placeholder:text-white/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              {/* Stars Selector */}
              <div>
                <label className="block text-[10px] font-black mb-5 text-white/40 uppercase tracking-[0.2em]">Estrellas recibidas</label>
                <StarRating 
                  rating={rating} 
                  setRating={setRating} 
                  hoverRating={hoverRating} 
                  setHoverRating={setHoverRating} 
                />
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-[10px] font-black mb-5 text-white/40 uppercase tracking-[0.2em]">Idioma de la respuesta</label>
                <LanguageSelector selected={language} onSelect={setLanguage} />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-[10px] font-black mb-5 text-white/40 uppercase tracking-[0.2em]">Tipo de negocio</label>
              <BusinessTypeSelector selected={businessType} onSelect={setBusinessType} />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-[10px] font-black mb-5 text-white/40 uppercase tracking-[0.2em]">Elige el tono de la respuesta</label>
              <ToneSelector selected={tone} onSelect={setTone} />
            </div>

            {/* Custom Instructions */}
            <AnimatePresence mode="wait">
              {tone === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-black mb-4 text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    ✍️ ¿Qué quieres incluir en la respuesta?
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ej: Pide disculpas por el ruido y ofrece un 10% de descuento en la próxima visita."
                    className="w-full h-32 bg-brand-primary/5 border border-brand-primary/20 p-6 rounded-2xl focus:bg-brand-primary/10 focus:border-brand-primary outline-none transition-all resize-none text-white text-lg font-medium placeholder:text-brand-primary/30"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-4"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.743-2.98L12.203 3.53a1.503 1.503 0 00-2.67 0L2.344 14.02c-.759 1.313.203 2.98 1.743 2.98z" /></svg>
                {error}
              </motion.div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-6 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                isGenerating 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' 
                  : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_50px_rgba(255,255,255,0.1)]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                tone === 'custom' ? 'Obtener respuesta experta' : 'Generar 3 opciones'
              )}
            </button>
          </div>
        </div>

        {/* Results / Skeleton */}
        <div id="results">
          {isGenerating && <SkeletonLoader />}
          
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold">Tus respuestas</h2>
                  <button 
                    onClick={handleGenerate}
                    className="text-brand-primary text-sm font-bold hover:underline"
                  >
                    Regenerar
                  </button>
                </div>

                <div className="space-y-6">
                  {responses.map((resp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="minimal-glass p-8 md:p-10 rounded-[2.5rem] relative group border border-white/5 hover:border-white/20 transition-all"
                    >
                      <div className="absolute -top-3 left-8 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-white/5">
                        <span>Opción {i + 1}</span>
                      </div>
                      {editingId === i ? (
                        <textarea
                          value={editedResponse}
                          onChange={(e) => setEditedResponse(e.target.value)}
                          className="w-full h-48 p-6 rounded-2xl bg-white/5 border border-white/20 outline-none transition-all resize-none text-white text-lg font-medium mb-8 focus:border-brand-primary"
                        />
                      ) : (
                        <p className="text-white text-xl leading-relaxed font-medium mb-10 whitespace-pre-wrap tracking-tight">
                          {resp}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4">
                        {editingId === i ? (
                          <>
                            <button
                              onClick={() => {
                                const newResponses = [...responses];
                                newResponses[i] = editedResponse;
                                setResponses(newResponses);
                                copyToClipboard(editedResponse, i);
                                setEditingId(null);
                              }}
                              className="flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-white text-black transition-all active:scale-95 hover:scale-105"
                            >
                              Guardar y Copiar
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 text-white/60 transition-all active:scale-95 hover:text-white hover:border-white/30"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => copyToClipboard(resp, i)}
                              className={`flex items-center gap-3 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                                copiedId === i 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                              }`}
                            >
                              {copiedId === i ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                  ¡Listo!
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                  Copiar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(i);
                                setEditedResponse(resp);
                              }}
                              className="flex items-center gap-3 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all active:scale-95"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setRefiningId(refiningId === i ? null : i);
                                setRefineText('');
                              }}
                              className={`flex items-center gap-3 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                                refiningId === i 
                                  ? 'bg-brand-primary text-black' 
                                  : 'border border-white/10 text-white/60 hover:text-white hover:border-white/30'
                              }`}
                            >
                              Refinar ✨
                            </button>
                          </>
                        )}
                      </div>

                      {/* Refinement Interface */}
                      <AnimatePresence>
                        {refiningId === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-brand-primary/10 space-y-4"
                          >
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={refineText}
                                onChange={(e) => setRefineText(e.target.value)}
                                placeholder="Ej: Hazla más corta, añade que tenemos terraza..."
                                className="flex-1 p-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 outline-none focus:border-brand-primary transition-all text-sm font-medium"
                                onKeyDown={(e) => e.key === 'Enter' && handleRefine(i)}
                              />
                              <button
                                onClick={() => handleRefine(i)}
                                disabled={isRefining || !refineText.trim()}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                  isRefining || !refineText.trim()
                                    ? 'bg-border-color text-text-secondary cursor-not-allowed'
                                    : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/10 active:scale-95'
                                }`}
                              >
                                {isRefining ? 'Procesando...' : 'Aplicar'}
                              </button>
                            </div>
                            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                              La IA transformará esta respuesta según tus instrucciones.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-text-secondary text-sm italic mt-8">
                  Copia la respuesta que más te guste y pégala en Google Maps.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-background border-l border-white/10 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col pt-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-10">
                <h2 className="text-2xl font-black font-outfit text-white tracking-tight text-gradient">Historial</h2>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-8 space-y-12 flex-1">
                {historyItems.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs">Sin registros</p>
                  </div>
                ) : (
                  historyItems.map((item, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <div className="flex gap-2 items-center bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          <span className="text-brand-primary">{item.stars} ⭐️</span>
                        </div>
                      </div>
                      <p className="text-white text-lg font-medium tracking-tight italic opacity-60">"{item.review}"</p>
                      <div className="space-y-4 pt-2">
                        {item.responses.map((r: string, ri: number) => (
                          <div key={ri} className="bg-white/5 p-6 rounded-2xl border border-white/5 relative group hover:border-white/20 transition-all">
                            <p className="text-sm font-medium text-white/80 mb-5 leading-relaxed">{r}</p>
                            <button 
                              onClick={() => {
                                copyToClipboard(r, i * 100 + ri);
                                setTimeout(() => setShowHistory(false), 800);
                              }}
                              className={`text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition-all w-full justify-center ${copiedId === i * 100 + ri ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
                            >
                              {copiedId === i * 100 + ri ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Verification Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 transition-all"
            onClick={() => setShowProModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="minimal-glass w-full max-w-sm rounded-[2rem] p-10 border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black font-outfit mb-2 text-white text-gradient">Validar Pro</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">Introduce tu email de suscripción para acceder.</p>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={proInputEmail}
                    onChange={(e) => setProInputEmail(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-primary/50 outline-none transition-all text-white font-medium text-sm placeholder:text-white/20"
                  />
                  {proVerifyError && <p className="text-red-400 text-[10px] font-bold mt-3 uppercase tracking-[0.2em]">{proVerifyError}</p>}
                </div>
                
                <button
                  onClick={() => verifyPro(proInputEmail)}
                  className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Verificar acceso
                </button>
                
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full text-white/40 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all"
                >
                  Volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>}>
      <PageContent />
    </Suspense>
  );
}
