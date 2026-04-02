import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center mb-8">
        <span className="text-4xl">🏝️</span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
        ¡Vaya! Página no encontrada
      </h1>
      <p className="text-lg text-text-secondary max-w-md mb-12">
        Parece que te has perdido por el Mediterráneo. No te preocupes, siempre puedes volver a casa.
      </p>
      <Link 
        href="/"
        className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        Volver al inicio
      </Link>
      
      <div className="mt-20 opacity-20 pointer-events-none">
        <p className="font-serif italic text-8xl font-black">404</p>
      </div>
    </div>
  );
}
