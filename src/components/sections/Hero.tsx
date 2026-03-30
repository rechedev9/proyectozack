'use client';

import { useEffect } from 'react';
import * as m from 'motion/react-client';
import { useMotionValue, useSpring, useTransform } from 'motion/react';
import Image from 'next/image';

export function Hero() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  // Pink center aura: se mueve suavemente CON el ratón
  const pinkX = useTransform(smoothX, [0, 1], [-50, 50]);
  const pinkY = useTransform(smoothY, [0, 1], [-50, 50]);

  // Orange top-right aura: sentido contrario (efecto profundidad)
  const orangeX = useTransform(smoothX, [0, 1], [25, -25]);
  const orangeY = useTransform(smoothY, [0, 1], [20, -20]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative bg-sp-black text-white overflow-hidden min-h-dvh flex flex-col pt-16">

      {/* Auras: breathing animation + mouse parallax */}
      <div className="absolute inset-0 pointer-events-none" style={{ contain: 'paint' }}>
        <m.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-500px',
            marginTop: '-500px',
            width: '1000px',
            height: '1000px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, #e03070 0%, transparent 60%)',
            filter: 'blur(80px)',
            x: pinkX,
            y: pinkY,
          }}
        />
        <m.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '800px',
            height: '800px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, #f5632a 0%, transparent 70%)',
            filter: 'blur(100px)',
            x: orangeX,
            y: orangeY,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center text-center pb-20">

        {/* Logo mark */}
        <m.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <m.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <Image
              src="/images/logos/2.png"
              alt="SocialPro Mark"
              width={100}
              height={100}
              priority
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_25px_rgba(224,48,112,0.4)]"
            />
          </m.div>
          <div className="absolute inset-0 bg-sp-pink/20 blur-2xl rounded-full animate-pulse" />
        </m.div>

        {/* Geo label */}
        <m.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-sp-muted2 mb-6"
        >
          Gaming &amp; Esports · Europa · LatAm · Turquía
        </m.span>

        {/* Headline */}
        <h1 className="font-display text-[4rem] sm:text-[6.5rem] md:text-[8rem] lg:text-[10rem] font-black uppercase leading-[0.85] tracking-tight mb-10">
          <m.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="block text-white"
          >
            CONECTAMOS
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="block"
            style={{
              background: 'linear-gradient(90deg, #f5632a 0%, #e03070 50%, #8b3aad 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(245,99,42,0.2))',
            }}
          >
            CREADORES
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="block text-white"
          >
            CON MARCAS
          </m.span>
        </h1>

        {/* Sub-content */}
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base sm:text-lg text-sp-muted2 mb-8 leading-relaxed font-medium"
          >
            13+ años operando en la élite del ecosistema. Representamos a los mejores talentos
            y ejecutamos campañas de iGaming con resultados exponenciales.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <m.a
              href="/contacto"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(224,48,112,0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-widest uppercase transition-shadow bg-sp-grad"
            >
              Iniciar Propuesta
            </m.a>
            <m.a
              href="/talentos"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-widest uppercase border border-white/10 backdrop-blur-sm transition-all"
            >
              Explorar Talentos
            </m.a>
          </m.div>
        </div>

        {/* Bottom stats */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-20 flex gap-12 sm:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {[
            { value: '13+', label: 'AÑOS' },
            { value: '15M', label: 'VIEWS/MES' },
            { value: '15', label: 'CAMPAÑAS' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-4xl font-black text-white leading-none">{value}</div>
              <div className="text-[10px] font-bold text-sp-muted2 tracking-widest mt-2">{label}</div>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
