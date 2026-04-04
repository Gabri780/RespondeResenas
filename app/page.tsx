'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const reviews = [
    {
      author: "María G.",
      stars: 5,
      text: "Increíble experiencia. La paella estaba buenísima y el camarero muy atento. Volveremos seguro!",
    },
    {
      author: "Carlos R.",
      stars: 2,
      text: "Tardaron 45 minutos en traernos la comida y las croquetas estaban frías. El sitio es bonito pero el servicio deja mucho que desear.",
    },
    {
      author: "Laura M.",
      stars: 3,
      text: "Comida correcta, nada especial. Los precios algo elevados para lo que ofrecen. El postre casero sí estaba rico.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-brand-primary/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-brand-primary flex items-center justify-center text-brand-primary font-outfit text-lg font-bold shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              P
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight hidden sm:block">RespondePro</span>
          </div>
          <nav className="flex gap-8 items-center">
            <Link href="/pricing" className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors">Precios</Link>
            <Link 
              href="/app" 
              className="group relative px-6 py-2.5 rounded-full overflow-hidden transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-white" />
              <span className="relative text-black font-bold text-sm">Probar gratis</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-40 pb-32">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Inteligencia Artificial para Negocios</span>
          </motion.div>
          
          <motion.h1 
            className="font-outfit text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-gradient"
            {...fadeInUp}
          >
            Responde reseñas <br /> con autoridad
          </motion.h1>
          
          <motion.p 
            className="text-text-secondary text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Pega la reseña, elige el tono y obtén respuestas quirúrgicas en segundos. Diseñado para la hostelería y el comercio de alto nivel.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link 
              href="/app" 
              className="inline-flex items-center justify-center bg-white text-black text-lg px-12 py-5 rounded-full font-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
            >
              Empezar ahora →
            </Link>
            <p className="mt-6 text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
              Sin registro necesario · 2 usos incluidos
            </p>
          </motion.div>
        </section>

        {/* Examples Section */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="text-left">
              <h2 className="font-outfit text-3xl font-bold mb-2">Simplicidad en la ejecución</h2>
              <p className="text-text-secondary font-medium">Haz clic en un ejemplo para ver la IA en acción</p>
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {reviews.map((review, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Link 
                  href={`/app?review=${encodeURIComponent(review.text)}&stars=${review.stars}`}
                  className="block h-full group minimal-glass p-8 rounded-[2rem] transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-2"
                >
                  <div className="flex mb-6 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${i < review.stars ? 'bg-brand-primary' : 'bg-white/10'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-foreground text-lg font-medium mb-8 leading-snug tracking-tight">
                    "{review.text}"
                  </p>
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-text-secondary text-xs font-bold uppercase tracking-widest">{review.author}</span>
                    <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-black transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-border-color bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="font-outfit text-xl font-bold mb-8">RespondePro</div>
          <p className="text-text-secondary text-xs font-bold uppercase tracking-[0.3em]">
            Precision AI · Excellence in Hospitality
          </p>
          <div className="mt-12 text-[10px] text-white/20 font-medium">
            © 2026 RespondePro. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
