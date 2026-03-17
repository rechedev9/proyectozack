'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SectionTag } from '@/components/ui/SectionTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientText } from '@/components/ui/GradientText';

const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  type: z.string().min(1, 'Tipo requerido'),
  company: z.string().optional(),
  message: z.string().min(10, 'Mensaje demasiado corto'),
});

type ContactForm = z.infer<typeof contactSchema>;

const TYPES = [
  { value: 'brand', label: 'Soy una marca / anunciante' },
  { value: 'talent', label: 'Soy un creador de contenido' },
  { value: 'other', label: 'Otro' },
];

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

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
    <section id="contacto" className="py-24 bg-sp-off">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Contáctanos</SectionTag>
          <SectionHeading>
            <GradientText>Hablemos</GradientText>
          </SectionHeading>
          <p className="mt-4 text-sp-muted text-sm">
            Cuéntanos tu proyecto. Respondemos en menos de 24h.
          </p>
        </div>

        {status === 'ok' ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-sp-dark mb-2">¡Mensaje enviado!</h3>
            <p className="text-sm text-sp-muted">Te respondemos en menos de 24h.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl border border-sp-border p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-sp-dark mb-1.5">Nombre *</label>
                <input
                  {...register('name')}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm text-sp-dark outline-none focus:border-sp-orange transition-colors"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-sp-dark mb-1.5">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm text-sp-dark outline-none focus:border-sp-orange transition-colors"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">¿Cómo puedes describirte? *</label>
              <select
                {...register('type')}
                className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm text-sp-dark outline-none focus:border-sp-orange transition-colors bg-white"
              >
                <option value="">Selecciona...</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Empresa / Canal (opcional)</label>
              <input
                {...register('company')}
                placeholder="Nombre de tu empresa o canal"
                className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm text-sp-dark outline-none focus:border-sp-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sp-dark mb-1.5">Mensaje *</label>
              <textarea
                {...register('message')}
                rows={4}
                placeholder="Cuéntanos qué tienes en mente..."
                className="w-full rounded-xl border border-sp-border px-4 py-3 text-sm text-sp-dark outline-none focus:border-sp-orange transition-colors resize-none"
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500 text-center">Error al enviar. Inténtalo de nuevo.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 rounded-full font-bold text-white text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#f5632a 0%,#e03070 35%,#c42880 62%,#8b3aad 100%)' }}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
