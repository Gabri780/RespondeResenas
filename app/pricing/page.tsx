'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

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
      name: "Prueba",
      price: "0€",
      desc: "Perfecto para experimentar la potencia de nuestra IA.",
      features: [
        "2 respuestas generadas",
        "Todos los tonos premium",
        "Modo personalización",
        "Sin tarjeta de crédito",
      ],
      cta: "Empezar ahora",
      href: "/app",
      highlight: false,
    },
    {
      name: "Pro",
      price: "19€",
      period: "/mes",
      desc: "Gestión profesional de la reputación de tu negocio.",
      features: [
        "Respuestas ilimitadas",
        "Historial inteligente",
        "Soporte prioritario",
        "Sin límites de caracteres",
        "Acceso anticipado a funciones",
      ],
      cta: "Suscribirse ahora",
      href: "/app",
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background text-white selection:bg-brand-primary selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-brand-primary flex items-center justify-center text-brand-primary font-outfit text-xl font-bold transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(197,160,89,0.1)]">
              P
            </div>
            <span className="font-outfit text-2xl font-bold tracking-tight text-gradient">RespondePro</span>
          </Link>
          <div className="flex gap-10 items-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Inicio</Link>
            <Link 
              href="/app" 
              className="px-8 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-32">
          <motion.h1 
            {...fadeInUp}
            className="font-outfit text-5xl md:text-7xl font-bold mb-8 tracking-tighter"
          >
            Inversión en <span className="text-gradient italic">Reputación</span>
          </motion.h1>
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Escoge el plan que mejor se adapte a tu volumen de clientes. Sin permanencia, sin complicaciones.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fadeInUp}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`minimal-glass rounded-[3rem] p-12 flex flex-col border transition-all ${
                plan.highlight 
                  ? 'border-brand-primary/30 shadow-[0_0_50px_rgba(197,160,89,0.05)] scale-[1.02]' 
                  : 'border-white/5'
              }`}
            >
              <div className="mb-12">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-black font-outfit text-gradient">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-white/20 text-xl font-bold">{plan.period}</span>}
                </div>
                <p className="text-white/40 text-sm font-medium leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="space-y-6 mb-16 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-4 text-sm font-bold text-white/80">
                    <CheckIcon />
                    <span className="tracking-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === 'Pro' ? (
                <div className="space-y-6">
                  <input 
                    type="email" 
                    placeholder="Tu email de suscripción" 
                    className="w-full p-6 rounded-[1.5rem] bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-primary/50 outline-none transition-all text-white font-medium text-lg placeholder:text-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-6 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_50px_rgba(255,255,255,0.1)] disabled:opacity-50"
                  >
                    {loading ? 'Cargando...' : plan.cta}
                  </button>
                </div>
              ) : (
                <Link 
                  href={plan.href}
                  className="w-full py-6 rounded-[1.5rem] border border-white/10 bg-white/5 text-white font-black text-xs uppercase tracking-[0.2em] text-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.5 }}
          className="mt-40 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">
            Proyectos a gran escala
          </p>
          <a href="mailto:hola@respondepro.es" className="text-xl font-bold hover:text-brand-primary transition-colors text-gradient pb-1 border-b-2 border-brand-primary/20 hover:border-brand-primary">
            Contacta para planes corporativos →
          </a>
        </motion.div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
          © 2026 RespondePro · Lujo en el Servicio
        </p>
      </footer>
    </div>
  );
}
