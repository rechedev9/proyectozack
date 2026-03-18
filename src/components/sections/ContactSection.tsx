'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as m from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';
import { FadeInOnScroll } from '@/components/ui/FadeInOnScroll';

const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.email('Email inválido'),
  phone: z.string().optional(),
  type: z.string().min(1, 'Tipo requerido'),
  company: z.string().optional(),
  message: z.string().min(10, 'Mensaje demasiado corto'),
  // Brand-specific
  budget: z.string().optional(),
  timeline: z.string().optional(),
  audience: z.string().optional(),
  // Creator-specific
  platform: z.string().optional(),
  viewers: z.string().optional(),
  monetization: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const TYPES = [
  { value: 'brand', label: 'Soy una marca / anunciante' },
  { value: 'talent', label: 'Soy un creador de contenido' },
  { value: 'other', label: 'Otro' },
];

const BUDGET_RANGES = [
  { value: '<5k', label: 'Menos de 5.000 €' },
  { value: '5k-15k', label: '5.000 € — 15.000 €' },
  { value: '15k-50k', label: '15.000 € — 50.000 €' },
  { value: '50k+', label: 'Más de 50.000 €' },
];

const TIMELINE_OPTIONS = [
  { value: 'urgent', label: 'Lo antes posible (< 2 semanas)' },
  { value: '1month', label: '1 mes' },
  { value: '2-3months', label: '2-3 meses' },
  { value: 'flexible', label: 'Flexible / sin fecha' },
];

const PLATFORM_OPTIONS = [
  { value: 'twitch', label: 'Twitch' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'cs2', label: 'CS2' },
  { value: 'other', label: 'Otra' },
];

const INFO_CARDS = [
  {
    icon: '🎯',
    title: 'Para marcas',
    desc: 'Lanza campañas con los mejores creadores gaming. Selección, ejecución y resultados medibles.',
  },
  {
    icon: '🎮',
    title: 'Para creadores',
    desc: 'Accede a colaboraciones premium, gestión de canal y desarrollo de marca personal.',
  },
];

const inputClasses =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-sp-orange transition-colors';
const selectClasses =
  'w-full rounded-xl border border-white/10 bg-sp-black px-4 py-3 text-sm text-white outline-none focus:border-sp-orange transition-colors';
const labelClasses = 'block text-xs font-semibold text-sp-muted2 mb-1.5 uppercase tracking-widest';

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const selectedType = watch('type');

  const onSubmit = async (data: ContactForm) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus('ok');
      reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contacto" className="py-24 bg-sp-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <SectionTag>Trabajemos juntos</SectionTag>
            <SectionHeading className="text-white">
              Hablemos <GradientText>Hoy</GradientText>
            </SectionHeading>
          </div>
        </FadeInOnScroll>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left — info cards */}
          <FadeInOnScroll delay={0.1}>
            <div className="space-y-4">
              {INFO_CARDS.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-sp-muted2 leading-relaxed">{desc}</p>
                </div>
              ))}

              {/* Contacto directo */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-bold text-white mb-3">Contacto directo</h3>
                <div className="space-y-2 text-sm text-sp-muted2">
                  <p>
                    <span className="text-white font-semibold">📞 </span>
                    <a href="tel:+34604868426" className="hover:text-white transition-colors">
                      +34 604 868 426
                    </a>
                  </p>
                  <p>
                    <span className="text-white font-semibold">✉️ </span>
                    <a href="mailto:marketing@socialpro.es" className="hover:text-white transition-colors">
                      marketing@socialpro.es
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Right — form */}
          <FadeInOnScroll delay={0.2}>
            <div>
              {status === 'ok' ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <div className="text-3xl mb-3">✅</div>
                  <h3 className="font-bold text-white mb-2">¡Mensaje enviado!</h3>
                  <p className="text-sm text-sp-muted2">Te respondemos en menos de 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Nombre *</label>
                      <input
                        {...register('name')}
                        placeholder="Tu nombre"
                        className={inputClasses}
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="tu@email.com"
                        className={inputClasses}
                      />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Teléfono</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+34 600 000 000"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>SOY… *</label>
                      <select {...register('type')} className={selectClasses}>
                        <option value="" className="bg-sp-black">Selecciona...</option>
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value} className="bg-sp-black">
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Empresa / Canal</label>
                    <input
                      {...register('company')}
                      placeholder="Nombre de tu empresa o canal"
                      className={inputClasses}
                    />
                  </div>

                  {/* Brand-specific fields */}
                  <AnimatePresence initial={false}>
                    {selectedType === 'brand' && (
                      <m.div
                        key="brand-fields"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClasses}>Presupuesto estimado</label>
                              <select {...register('budget')} className={selectClasses}>
                                <option value="" className="bg-sp-black">Selecciona rango...</option>
                                {BUDGET_RANGES.map((b) => (
                                  <option key={b.value} value={b.value} className="bg-sp-black">
                                    {b.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClasses}>Plazo / Timeline</label>
                              <select {...register('timeline')} className={selectClasses}>
                                <option value="" className="bg-sp-black">Selecciona plazo...</option>
                                {TIMELINE_OPTIONS.map((t) => (
                                  <option key={t.value} value={t.value} className="bg-sp-black">
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={labelClasses}>Público objetivo</label>
                            <input
                              {...register('audience')}
                              placeholder="Ej: Jugadores de slots 25-40 España"
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* Creator-specific fields */}
                  <AnimatePresence initial={false}>
                    {selectedType === 'talent' && (
                      <m.div
                        key="talent-fields"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClasses}>Plataforma principal</label>
                              <select {...register('platform')} className={selectClasses}>
                                <option value="" className="bg-sp-black">Selecciona...</option>
                                {PLATFORM_OPTIONS.map((p) => (
                                  <option key={p.value} value={p.value} className="bg-sp-black">
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClasses}>Viewers / Suscriptores</label>
                              <input
                                {...register('viewers')}
                                placeholder="Ej: 500 viewers avg / 50K subs"
                                className={inputClasses}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={labelClasses}>Estado de monetización</label>
                            <input
                              {...register('monetization')}
                              placeholder="Ej: Partner Twitch, sponsors activos, etc."
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className={labelClasses}>Mensaje *</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Cuéntanos qué tienes en mente..."
                      className={`${inputClasses} resize-none`}
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-400 text-center">Error al enviar. Inténtalo de nuevo.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="text-sm font-bold text-sp-orange hover:underline disabled:opacity-60 focus:outline-none"
                  >
                    {status === 'sending' ? 'Enviando...' : 'Enviar mensaje →'}
                  </button>
                </form>
              )}
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
