'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components ---

const StarRating = ({ rating, setRating, hoverRating, setHoverRating }: any) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-transform active:scale-90"
        >
          <svg
            className={`w-8 h-8 ${
              (hoverRating || rating) >= star ? 'text-brand-primary' : 'text-border-color'
            } transition-colors`}
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
          className={`px-4 py-2.5 rounded-full border text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            selected === type.id
              ? 'bg-brand-primary text-white border-brand-primary shadow-md'
              : 'bg-white border-border-color text-foreground hover:border-brand-primary/50'
          }`}
        >
          <span>{type.icon}</span>
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
          className={`px-4 py-2.5 rounded-full border text-sm font-bold transition-all ${
            selected === lang
              ? 'bg-brand-primary text-white border-brand-primary shadow-md'
              : 'bg-white text-foreground border-border-color hover:border-brand-primary/50'
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {tones.map((tone) => (
        <button
          key={tone.id}
          type="button"
          onClick={() => onSelect(tone.id)}
          className={`flex flex-col items-center p-4 rounded-2xl border text-left transition-all min-h-[100px] ${
            selected === tone.id
              ? 'bg-brand-primary/5 border-brand-primary ring-2 ring-brand-primary/20 bg-white'
              : 'bg-white border-border-color hover:border-brand-primary/30'
          }`}
        >
          <span className="text-2xl mb-1">{tone.icon}</span>
          <span className="font-bold text-foreground text-sm">{tone.label}</span>
          <span className="text-[10px] text-text-secondary leading-tight text-center">{tone.desc}</span>
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
      setError('Has alcanzado el límite diario de 2 respuestas gratuitas.');
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
      case 'profesional': return 'bg-[#F5F1EA]';
      case 'cercano': return 'bg-[#EDF7ED]';
      case 'humor': return 'bg-[#FFF9E6]';
      default: return 'bg-white';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-color">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-serif text-sm font-bold transition-transform group-hover:scale-110 shadow-sm">
              P
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight hidden sm:block">RespondePro</span>
          </Link>
            <div className="flex items-center gap-4">
              {!isPro && (
                <button 
                  onClick={() => setShowProModal(true)}
                  className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest transition-colors mr-2"
                >
                  ¿Ya eres Pro?
                </button>
              )}
              {isPro && (
                <div className="flex items-center gap-1.5 bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-wider">Plan Pro Activo</span>
                </div>
              )}
              <button onClick={() => setShowHistory(true)} className="text-xs font-bold text-text-secondary hover:text-brand-primary uppercase tracking-widest transition-colors mr-2">Historial</button>
              <Link href="/pricing" className="text-xs font-bold text-text-secondary hover:text-brand-primary uppercase tracking-widest transition-colors mr-2">Precios</Link>
              {!isPro && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border-color shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${usageCount >= 2 ? 'bg-red-500' : 'bg-brand-primary animate-pulse'}`}></span>
                  <span className="text-xs font-bold text-text-secondary uppercase">{Math.max(0, 2 - usageCount)}/2 gratis</span>
                </div>
              )}
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-8 pb-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 border border-border-color p-6 md:p-8 mb-12">
          <div className="space-y-8">
            {/* Business Name Input */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Nombre de tu negocio (opcional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Bar El Rincón"
                className="w-full p-4 rounded-xl border-2 border-border-color bg-[#FDF8F3]/50 focus:bg-white focus:border-brand-primary/50 outline-none transition-all text-foreground text-sm md:text-base shadow-inner"
              />
            </div>

            {/* Review Input */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Pega aquí la reseña de Google</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ej. 'Increíble experiencia. La paella estaba buenísima...'"
                className="w-full h-40 p-4 rounded-xl border-2 border-border-color bg-[#FDF8F3]/50 focus:bg-white focus:border-brand-primary/50 outline-none transition-all resize-none text-foreground text-sm md:text-base shadow-inner"
              />
            </div>

            {/* Stars Selector */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Estrellas recibidas</label>
              <StarRating 
                rating={rating} 
                setRating={setRating} 
                hoverRating={hoverRating} 
                setHoverRating={setHoverRating} 
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Tipo de negocio</label>
              <BusinessTypeSelector selected={businessType} onSelect={setBusinessType} />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Elige el tono de la respuesta</label>
              <ToneSelector selected={tone} onSelect={setTone} />
            </div>

            {/* Custom Instructions (shown only when tone is 'custom') */}
            <AnimatePresence mode="wait">
              {tone === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-bold mb-3 text-brand-primary tracking-tight flex items-center gap-2">
                    <span className="text-lg">✍️</span>
                    ¿Qué quieres que diga la IA? (Contexto, excusas, regalos...)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ej: Dile que el aire se rompió pero que ya está arreglado y que le invitamos a un café la próxima vez para compensarle."
                    className="w-full h-32 p-4 rounded-xl border-2 border-brand-primary/30 bg-brand-primary/5 focus:bg-white focus:border-brand-primary outline-none transition-all resize-none text-foreground text-sm md:text-base shadow-inner placeholder:text-brand-primary/40"
                  />
                  <p className="mt-2 text-[10px] text-brand-primary/60 font-bold uppercase tracking-wider">
                    La IA redactará 3 opciones profesionales siguiendo tu instrucción.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-bold mb-3 text-foreground tracking-tight">Idioma de la respuesta</label>
              <LanguageSelector selected={language} onSelect={setLanguage} />
            </div>

            {error && (
              <div className="space-y-4">
                <motion.p 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-red-600 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </motion.p>
                
                {!isPro && usageCount >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-primary rounded-2xl p-6 text-white shadow-xl shadow-brand-primary/20"
                  >
                    <h3 className="font-serif text-xl font-bold mb-2">Hazte Pro por 4,99€/mes</h3>
                    <p className="text-white/80 text-sm mb-6 font-medium">Desbloquea respuestas ilimitadas, acceso al historial completo y soporte prioritario.</p>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="email" 
                        placeholder="Tu email para la suscripción" 
                        className="p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all font-bold text-sm"
                        value={proInputEmail}
                        onChange={(e) => setProInputEmail(e.target.value)}
                      />
                      <button 
                        onClick={() => handleStripeCheckout()}
                        disabled={isCheckoutLoading}
                        className={`w-full bg-white text-brand-primary py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 ${isCheckoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isCheckoutLoading ? 'Cargando...' : 'Suscribirse ahora'}
                      </button>
                      {proVerifyError && <p className="text-white text-[10px] font-bold uppercase tracking-wider text-center">{proVerifyError}</p>}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl min-h-[60px] ${
                isGenerating 
                  ? 'bg-border-color cursor-not-allowed text-text-secondary' 
                  : tone === 'custom'
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-[1.01] active:scale-[0.98] shadow-brand-primary/30'
                    : 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-[1.01] active:scale-[0.98] shadow-brand-primary/30'
              }`}
            >
              {isGenerating ? 'Generando respuestas...' : tone === 'custom' ? 'Generar respuesta experta' : 'Generar 3 respuestas'}
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${getToneColor(tone)} border border-border-color p-6 md:p-8 rounded-3xl relative group shadow-sm`}
                    >
                      <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border-color text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <span>Opción {i + 1}</span>
                      </div>
                      {editingId === i ? (
                        <textarea
                          value={editedResponse}
                          onChange={(e) => setEditedResponse(e.target.value)}
                          className="w-full h-32 p-4 rounded-xl border-2 border-brand-primary outline-none transition-all resize-none text-foreground text-sm font-medium mb-6 bg-white"
                        />
                      ) : (
                        <p className="text-foreground leading-relaxed font-medium mb-6 whitespace-pre-wrap">
                          {resp}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3">
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
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-brand-primary bg-brand-primary text-white transition-all active:scale-95 min-h-[44px] hover:bg-brand-primary/90"
                            >
                              Guardar y Copiar
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-border-color bg-white text-text-secondary transition-all active:scale-95 min-h-[44px] hover:border-text-secondary"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => copyToClipboard(resp, i)}
                              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 min-h-[44px] ${
                                copiedId === i 
                                  ? 'bg-green-600 border-green-600 text-white' 
                                  : 'bg-white border-border-color hover:border-brand-primary hover:text-brand-primary'
                              }`}
                            >
                              {copiedId === i ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  ¡Copiado!
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                  Copiar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(i);
                                setEditedResponse(resp);
                              }}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 bg-white border-border-color text-foreground hover:border-brand-primary hover:text-brand-primary transition-all active:scale-95 min-h-[44px]"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setRefiningId(refiningId === i ? null : i);
                                setRefineText('');
                              }}
                              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 min-h-[44px] ${
                                refiningId === i 
                                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                                  : 'bg-white border-border-color text-foreground hover:border-brand-primary hover:text-brand-primary'
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

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[100] flex justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-color flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                <h2 className="text-xl font-bold font-serif text-foreground">Tu Historial</h2>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-border-color/50 hover:bg-border-color text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-6 space-y-6 flex-1">
                {historyItems.length === 0 ? (
                  <p className="text-text-secondary text-center py-10 font-medium">Aún no hay historial guardado.</p>
                ) : (
                  historyItems.map((item, i) => (
                    <div key={i} className="bg-white border border-border-color rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-xs font-bold text-text-secondary">
                        <span>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <div className="flex gap-1 items-center bg-white px-2 py-1 rounded-md border border-border-color shadow-sm">
                          <span className="text-brand-primary">{item.stars}</span>
                          <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                      </div>
                      <p className="text-sm text-foreground italic line-clamp-3">"{item.review}"</p>
                      <div className="space-y-3 pt-2">
                        {item.responses.map((r: string, ri: number) => (
                          <div key={ri} className="bg-[#FDF8F3] p-4 rounded-xl border border-[#F5E1C8] relative group hover:border-brand-primary/40 transition-colors">
                            <p className="text-sm font-medium text-foreground mb-3">{r}</p>
                            <button 
                              onClick={() => {
                                copyToClipboard(r, i * 100 + ri);
                                setTimeout(() => setShowHistory(false), 800);
                              }}
                              className={`text-xs flex items-center gap-1.5 font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors w-full justify-center ${copiedId === i * 100 + ri ? 'bg-green-600 border-green-600 text-white' : 'bg-white border border-border-color text-foreground hover:text-brand-primary hover:border-brand-primary shadow-sm'}`}
                            >
                              {copiedId === i * 100 + ri ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                  Copiar
                                </>
                              )}
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
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowProModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold font-serif mb-2">Bienvenido de nuevo</h2>
              <p className="text-text-secondary text-sm mb-6">Introduce el email con el que te suscribiste a RespondePro.</p>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={proInputEmail}
                    onChange={(e) => setProInputEmail(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-border-color bg-[#FDF8F3]/50 focus:bg-white focus:border-brand-primary/50 outline-none transition-all text-sm font-bold"
                  />
                  {proVerifyError && <p className="text-red-600 text-[10px] font-bold mt-2 uppercase tracking-wider">{proVerifyError}</p>}
                </div>
                
                <button
                  onClick={() => verifyPro(proInputEmail)}
                  className="w-full bg-brand-primary text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Verificar acceso
                </button>
                
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full bg-white text-text-secondary py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-foreground transition-all"
                >
                  Cancelar
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
