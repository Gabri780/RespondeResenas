'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!email) {
      alert('Por favor, introduce tu email para continuar.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con Stripe. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Gratis",
      price: "0€",
      desc: "Perfecto para pequeños negocios locales.",
      features: [
        "5 respuestas de prueba",
        "Todos los tonos (Profesional, Cercano, Humor)",
        "Todos los tipos de negocios",
        "Prueba gratuita sin tarjeta",
      ],
      cta: "Empezar gratis",
      href: "/app",
      highlight: false,
    },
    {
      name: "Pro",
      price: "4,99€",
      period: "/mes",
      desc: "Para negocios con alta demanda y gestión activa.",
      features: [
        "Respuestas ilimitadas",
        "Acceso al historial completo",
        "Generación prioritaria",
        "Sin límites de uso",
        "Soporte prioritario 24/7",
      ],
      cta: "Hazte Pro",
      href: "/app", // placeholder
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-serif text-sm font-bold shadow-sm transition-transform group-hover:scale-110">
              P
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight">RespondePro</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-sm font-medium hover:text-brand-primary transition-colors">Volver</Link>
            <Link 
              href="/app" 
              className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Probar ahora
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl font-bold mb-6"
          >
            Precios sencillos y transparentes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg max-w-xl mx-auto"
          >
            Escoge el plan que mejor se adapte a tu negocio. Empieza gratis sin tarjeta de crédito.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all flex flex-col ${
                plan.highlight 
                  ? 'border-brand-primary shadow-2xl shadow-brand-primary/10 scale-105 z-10' 
                  : 'border-border-color shadow-lg shadow-brand-primary/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Más Recomendado
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {plan.period && <span className="text-text-secondary font-medium">{plan.period}</span>}
                </div>
                <p className="text-text-secondary text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm font-medium">
                    <div className="mt-0.5"><CheckIcon /></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === 'Pro' ? (
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Tu email para la suscripción" 
                    className="w-full p-4 rounded-2xl border-2 border-border-color bg-[#FDF8F3]/50 focus:bg-white focus:border-brand-primary/50 outline-none transition-all text-sm font-bold shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-center transition-all min-h-[56px] flex items-center justify-center bg-brand-primary text-white hover:bg-brand-primary/95 shadow-lg shadow-brand-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cargando...' : plan.cta}
                  </button>
                </div>
              ) : (
                <Link 
                  href={plan.href}
                  className={`w-full py-4 rounded-2xl font-black text-center transition-all min-h-[44px] flex items-center justify-center ${
                    plan.highlight 
                      ? 'bg-brand-primary text-white hover:bg-brand-primary/95 shadow-lg shadow-brand-primary/30 active:scale-[0.98]' 
                      : 'bg-white border-2 border-border-color text-foreground hover:border-brand-primary/50'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-sm text-text-secondary italic mb-4">
            ¿Necesitas una solución para una cadena de restaurantes o una agencia?
          </p>
          <a href="mailto:hola@respondepro.es" className="text-brand-primary font-bold hover:underline">
            Contacta con nosotros para planes Enterprise →
          </a>
        </div>
      </main>

      <footer className="py-12 border-t border-border-color text-center bg-white/30">
        <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">
          © 2026 RespondePro · El Mediterráneo en cada palabra
        </p>
      </footer>
    </div>
  );
}
