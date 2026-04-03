/**
 * Expands regulaciones and monetizar posts to 1200+ words.
 * Run after new-posts.ts.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema/index';
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    const unquoted = val.replace(/^["']|["']$/g, '');
    if (key && unquoted && !process.env[key]) process.env[key] = unquoted;
  }
} catch {}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const REGULACIONES_ADDITION = `

## Preguntas frecuentes sobre iGaming y streamers en España

### ¿Puedo hacer una campaña iGaming si tengo menores en mi audiencia?

No. Si un porcentaje significativo de tu audiencia es menor de edad, no puedes hacer campañas iGaming bajo la normativa española. YouTube Analytics y Twitch Analytics te muestran la distribución de edad de tu audiencia. Si el dato no está disponible o no es fiable, la regulación asume responsabilidad compartida entre operador y creador en caso de incumplimiento.

### ¿Tengo que revelar que es contenido patrocinado?

Sí, siempre. La identificación del contenido patrocinado es obligatoria tanto por la regulación española del juego como por las propias políticas de plataforma de Twitch y YouTube. El disclosure tiene que ser claro: no vale un hashtag pequeño al final, tiene que ser visible y comprensible para cualquier espectador.

### ¿Qué pasa si publico contenido iGaming sin cumplir la normativa?

Las consecuencias pueden incluir desde una advertencia del operador, hasta sanciones económicas de la DGOJ dirigidas al operador que derivarían en reclamaciones contractuales contra el creador, pasando por la retirada del contenido por parte de las plataformas. En casos graves, la DGOJ puede abrir expediente a personas físicas que hayan participado activamente en campañas ilegales.

### ¿Un acuerdo informal de un operador extranjero sin licencia española es suficiente?

No. Colaborar con operadores sin licencia DGOJ para audiencias en España es ilegal independientemente de que el operador esté legalmente establecido en otro país. El criterio es la audiencia receptora, no la ubicación del operador.

## En resumen

El iGaming en España ofrece oportunidades de monetización reales para creadores con la audiencia adecuada, pero requiere entender el marco regulatorio antes de comprometerse. La complejidad no tiene que ser un freno —hay agencias especializadas que gestionan todo el proceso de compliance— pero sí tiene que ser comprendida.

Si tienes dudas concretas sobre una campaña específica, la mejor inversión que puedes hacer es una consulta con un abogado especializado en regulación del juego antes de firmar cualquier contrato.`;

const MONETIZAR_ADDITION = `

## Construir audiencia antes de monetizar: el orden importa

Uno de los errores más comunes de creadores que buscan monetización temprana es intentar conseguir sponsors antes de tener métricas sólidas que justifiquen la inversión de una marca. El resultado suele ser deals de muy bajo valor o rechazo directo.

La secuencia que funciona es: primero construir una audiencia genuina con contenido consistente, después optimizar las métricas de retención, y solo entonces acercarse activamente a marcas o agencias.

¿Cuánto tiempo lleva? No hay una respuesta universal, pero los canales que consiguen sus primeros deals con marcas reales —no canjes de producto— suelen tener al menos 6-12 meses de publicación regular, más de 5.000 suscriptores activos, y una retención media por encima del 35%.

### La importancia de la consistencia frente al volumen

Publicar un vídeo a la semana de forma consistente durante un año genera más valor acumulado que publicar cinco vídeos en un mes y luego desaparecer. Las marcas y las agencias buscan creadores en los que puedan confiar para ejecutar campañas con plazos concretos. La consistencia en el historial del canal es una señal de profesionalidad que no requiere ningún certificado: está en los metadatos del canal para que cualquiera la vea.

Antes de buscar tu primer sponsor, revisa tu cadencia de publicación de los últimos seis meses. Si no es regular, ese es el primer problema que resolver.`;

async function main() {
  const updates = [
    { slug: 'regulaciones-igaming-espana-streamers', addition: REGULACIONES_ADDITION },
    { slug: 'monetizar-canal-youtube-gaming-2026', addition: MONETIZAR_ADDITION },
  ];

  for (const { slug, addition } of updates) {
    const [post] = await db
      .select({ bodyMd: schema.posts.bodyMd })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug));

    if (!post) {
      console.warn(`⚠  Post not found: ${slug}`);
      continue;
    }

    const newBody = post.bodyMd + addition;
    await db
      .update(schema.posts)
      .set({ bodyMd: newBody })
      .where(eq(schema.posts.slug, slug));

    const words = newBody.split(/\s+/).length;
    console.log(`✓  Expanded "${slug}" — ${words} words`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
