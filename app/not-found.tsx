import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center text-white">
      <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <span className="text-5xl opacity-40">🌙</span>
      </div>
      <h1 className="font-outfit text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-gradient leading-tight">
        Perdido en la <span className="italic">Noche</span>
      </h1>
      <p className="text-lg md:text-xl text-white/40 max-w-md mb-16 font-medium leading-relaxed">
        Esta página no existe, pero una reseña brillante siempre es un buen camino de vuelta.
      </p>
      <Link 
        href="/"
        className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
      >
        Volver al Inicio
      </Link>
      
      <div className="mt-32 opacity-[0.03] select-none pointer-events-none">
        <p className="font-outfit text-[15rem] font-black tracking-tighter leading-none">404</p>
      </div>
    </div>
  );
}
