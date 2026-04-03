'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-serif text-xl font-bold shadow-sm">
              P
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight hidden sm:block">RespondePro</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/pricing" className="text-sm font-bold text-text-secondary hover:text-brand-primary transition-colors">Precios</Link>
            <Link 
              href="/app" 
              className="bg-brand-primary text-white px-6 py-2.5 rounded-full font-bold transition-all hover:bg-brand-primary/90 min-h-[44px] flex items-center shadow-md active:scale-95"
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 text-center mb-24">
          <motion.h1 
            className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight"
            {...fadeInUp}
          >
            Responde a tus reseñas <br /> como un profesional
          </motion.h1>
          <motion.p 
            className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Pega la reseña de Google, elige el tono y obtén 3 respuestas perfectas con IA. <br className="hidden md:block" /> Hecho para negocios locales en España.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/app" 
              className="inline-flex items-center justify-center bg-brand-primary text-white text-lg px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-brand-primary/20 min-h-[56px]"
            >
              Probar gratis
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              Sin registro · 2 respuestas gratis
            </p>
          </motion.div>
        </section>

        {/* Examples Section */}
        <section className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="font-serif text-2xl md:text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Prueba con estos ejemplos
          </motion.h2>

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
                  className="block h-full group bg-white/50 border border-border-color p-6 rounded-3xl transition-all hover:bg-white hover:border-brand-primary/30 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < review.stars ? 'text-brand-primary' : 'text-border-color'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-foreground font-medium mb-4 italic">
                    "{review.text}"
                  </p>
                  <div className="mt-auto pt-4 border-t border-border-color/50 flex items-center justify-between">
                    <span className="text-text-secondary text-sm font-medium">— {review.author}</span>
                    <span className="text-brand-primary text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Probar →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border-color text-center">
        <p className="text-text-secondary text-sm">
          RespondePro — Hecho con IA para negocios locales en España
        </p>
      </footer>
    </div>
  );
}
