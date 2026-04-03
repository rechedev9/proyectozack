import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
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

// ─── Post bodies ──────────────────────────────────────────────────────────────

const REGULACIONES_IGAMING_BODY = `Si eres streamer y te han ofrecido una colaboración con una marca de iGaming —casa de apuestas, casino online, eSports betting o plataforma de skin trading—, necesitas entender las reglas antes de aceptar. En España, la regulación del juego online es una de las más estrictas de Europa, y los creadores de contenido que participan en campañas iGaming son corresponsables del cumplimiento normativo junto al operador.

Esta guía te explica qué es legal, qué no lo es, qué tienes que incluir obligatoriamente en tu contenido y cómo funciona la regulación en España comparada con LatAm. No es consejo legal —para eso necesitas un abogado especializado—, pero sí es un mapa claro del terreno que pisas.

## Qué es el iGaming legal en España

El iGaming legal en España incluye las apuestas deportivas online, el casino online (póker, ruleta, blackjack, slots), el bingo online y ciertos tipos de concursos. Para operar legalmente, todas estas actividades requieren una licencia expedida por la Dirección General de Ordenación del Juego (DGOJ), organismo dependiente del Ministerio de Consumo.

Los operadores con licencia DGOJ están sujetos a una regulación muy específica que afecta no solo a su operativa interna, sino también a cómo pueden hacer publicidad —incluyendo las campañas con influencers y streamers.

Si una marca de iGaming te contacta para una colaboración, lo primero que debes verificar es si tiene licencia DGOJ activa. Puedes comprobarlo en el registro público de la DGOJ. Colaborar con un operador sin licencia española implica riesgos legales para ti, no solo para ellos.

## Qué puede decir un streamer en una campaña iGaming

La Ley de Regulación del Juego y su normativa de desarrollo establece lo que está permitido en publicidad iGaming. Estas son las cosas que un streamer SÍ puede hacer en el contexto de una campaña legal:

Mostrar el producto del operador (interfaz de la plataforma, cómo funciona el juego, mecánicas básicas) en un contexto informativo y de entretenimiento.

Mencionar bonos de bienvenida o promociones actuales del operador, siempre que se mencionen las condiciones asociadas o se dirija al usuario a leerlas en la plataforma.

Usar un código de referido personalizado que genere trazabilidad de las conversiones.

Recomendar la plataforma desde la experiencia personal, siempre que sea honesta y no exagerada.

## Qué está prohibido en contenido iGaming en España

Estas son las restricciones más importantes que todo streamer debe conocer antes de aceptar una campaña iGaming:

### Prohibiciones absolutas

Dirigir el contenido a menores de edad o emitir contenido con temáticas dirigidas a menores durante la campaña. Esto incluye jugar a videojuegos con clasificación PEGI +3 o +7 mientras se hace mención activa a la plataforma iGaming.

Asociar el iGaming con la resolución de deudas, problemas económicos o como fuente de ingresos recurrente. Frases como "con esto pago el alquiler" o "lo que gané me permitió salir de deudas" están expresamente prohibidas.

Garantizar o sugerir que se puede ganar dinero de forma consistente. El azar es parte del producto y no puede presentarse como algo predecible.

Emitir publicidad iGaming entre las 06:00 y las 22:00 horas en los medios audiovisuales regulados. Para streamers en plataformas digitales como Twitch o YouTube, la aplicación de este horario es más compleja —consulta con el operador y tu agencia.

### Obligaciones de disclosure

El disclaimer de juego responsable debe aparecer de forma visible y audible en los primeros 30 segundos de cualquier pieza de contenido patrocinada. No vale ponerlo al final de un stream de 4 horas.

El contenido debe identificarse claramente como publicidad: "contenido patrocinado", "publicidad" o equivalentes. En Twitch, esto incluye activar el marcador nativo de contenido patrocinado.

## Diferencias clave: España vs LatAm

Si haces contenido que llega a audiencias de varios países hispanohablantes, necesitas entender que la regulación NO es uniforme.

En México, la Ley Federal de Juegos y Sorteos es más antigua y menos específica en lo que respecta a publicidad online. Los operadores con permiso de la Secretaría de Gobernación pueden hacer campañas con más libertad de mensaje, aunque los principios de no dirigirse a menores y no garantizar ganancias aplican también.

En Colombia, Coljuegos es el regulador y tiene uno de los marcos más modernos de LatAm. Las obligaciones de disclosure son similares a las españolas, aunque con matices propios.

En Argentina, la regulación es provincial: cada provincia tiene su propia normativa. Buenos Aires ciudad tiene licencias propias, mientras que en el resto del país la situación legal es más ambigua.

Chile y Perú están en proceso de modernización regulatoria, con marcos que se están definiendo en 2025-2026.

La consecuencia práctica para creadores que generan contenido para toda la comunidad hispanohablante: aplica siempre el estándar más estricto (el español) como mínimo, y ajusta el mensaje según el mercado cuando el operador te proporcione briefings específicos por país.

## Cómo gestiona SocialPro el compliance en sus campañas

SocialPro tiene un protocolo de compliance iGaming integrado en todas sus campañas. Esto incluye:

Un briefing de compliance específico para cada campaña que detalla qué puede decirse, qué no puede decirse y qué mensajes de juego responsable deben incluirse.

Revisión pre-publicación de todo el contenido: ningún stream, vídeo o post de un creador de SocialPro sale publicado sin revisión del equipo de compliance.

Verificación documental de que todos los creadores que participan en campañas iGaming son mayores de 18 años.

Gestión de contratos que protegen al creador en caso de cambios regulatorios, especificando claramente las responsabilidades de cada parte.

Esto no solo protege legalmente a los creadores, sino que también construye relaciones más sólidas con los operadores, que prefieren trabajar con agencias que minimizan su riesgo regulatorio.

Si quieres entender mejor cómo funciona nuestra metodología de trabajo, visita socialpro.es/servicios/igaming. Si eres creador y quieres acceder a campañas iGaming gestionadas con compliance profesional, aplica en socialpro.es/para-creadores.

## Consejos prácticos antes de firmar una campaña iGaming

Verifica la licencia del operador en el registro DGOJ antes de firmar cualquier contrato.

Pide por escrito el briefing de compliance: qué puedes decir, qué no puedes decir, y qué mensajes de juego responsable debes incluir.

Asegúrate de que el contrato especifica quién es responsable de qué en caso de reclamación regulatoria.

Guarda evidencia de las piezas que publicaste exactamente como quedaron: capturas, vídeos descargados, pantallazos con fecha. Si hay una reclamación, esa evidencia es tu protección.

No aceptes campañas de operadores sin licencia española si tu audiencia principal está en España. El riesgo regulatorio recae parcialmente sobre ti.

Y si tienes dudas sobre un caso concreto, consulta con un abogado especializado en regulación del juego online antes de publicar.`;

const GUIA_MARKETING_GAMING_BODY = `El marketing gaming en España no es lo que era hace cinco años. Lo que empezó siendo una apuesta de marcas tecnológicas y energéticas por llegar a un público joven se ha convertido en uno de los canales de mayor crecimiento y sofisticación del marketing digital en el mercado hispano.

Esta guía es el punto de partida para cualquier marca o profesional del marketing que quiera entender el estado del mercado en 2026, tomar mejores decisiones de inversión y evitar los errores más comunes de quienes llegan al gaming sin conocer sus reglas.

## El estado del mercado gaming en España en 2026

España tiene más de 16 millones de jugadores activos y un mercado de videojuegos que supera los 2.400 millones de euros. El gaming no es un nicho: es el entretenimiento masivo de la generación de 18 a 35 años, una demografía con alta renta disponible y una predisposición muy baja a la publicidad convencional.

Lo que hace al gaming especialmente interesante para las marcas es la naturaleza del consumo de contenido. Los espectadores de Twitch pasan una media de 45 minutos por sesión, frente a los 2-3 minutos de una red social. El nivel de atención y la relación de confianza con los creadores de contenido no tiene parangón en ningún otro canal.

El resultado: las marcas que hacen marketing gaming bien ejecutado obtienen tasas de conversión que otros canales no pueden igualar, especialmente en categorías como iGaming, hardware, periféricos, energéticas y fintech.

## Las tres plataformas que importan en gaming marketing

### Twitch: el rey del directo

Twitch domina el streaming en vivo en el mercado hispano. Sus métricas más relevantes para marcas son el tiempo de visionado por sesión (muy superior a cualquier otra plataforma), el engagement del chat (interacción directa entre streamer y audiencia en tiempo real) y la trazabilidad de conversiones mediante códigos únicos.

Twitch es la plataforma ideal para activaciones con conversión directa: el momento en que el streamer menciona el código y lo pone en pantalla, la audiencia responde inmediatamente. Los FTDs (First Time Deposits) en campañas iGaming, las ventas con código de descuento en periféricos y los registros en plataformas son métricas que Twitch facilita con una precisión difícil de conseguir en otros canales.

### YouTube: el canal de referencia y largo plazo

YouTube aporta lo que Twitch no puede: contenido con vida útil extendida. Un vídeo de gaming bien optimizado puede generar el 60% de sus visualizaciones en los seis meses siguientes a su publicación, lo que lo convierte en un canal de brand awareness de largo plazo con coste por impresión decreciente.

Los formatos más efectivos en YouTube gaming son las reviews de producto, las guías y tutorials, los vídeos de highlight con storytelling y los documentales cortos sobre competiciones o jugadores. Para marcas de hardware, periféricos y servicios que se benefician de una explicación detallada, YouTube es indispensable.

### TikTok: el canal de descubrimiento

TikTok ha ganado cuota en el gaming hispano, especialmente entre audiencias menores de 25 años. No es el mejor canal para conversión directa, pero sí para descubrimiento de marca y amplificación de campañas. Las marcas que lo integran como un tercer elemento de sus campañas gaming, complementando Twitch y YouTube, ven un efecto de refuerzo en el reconocimiento de marca.

## Tipos de campaña gaming y cuándo usar cada uno

**Activación en directo (Twitch):** el creador juega o usa el producto en stream con mención activa. Ideal para conversión directa. Requiere briefing claro y revisión de contenido.

**Review o comparativa (YouTube):** el creador analiza el producto en detalle. Ideal para productos que se benefician de una explicación —hardware, software, servicios—. Genera contenido evergreen con tráfico orgánico continuado.

**Integración de producto:** el producto aparece en el contenido del creador de forma natural, sin interrupción del flujo. Efectivo para brand awareness. Más difícil de medir directamente.

**Torneo patrocinado:** la marca patrocina un torneo o competición. Alto alcance, alta visibilidad, pero más difícil de atribuir conversiones directas.

**Código de referido permanente:** el creador tiene un código propio para mencionar en cualquier momento de su contenido. Genera un flujo continuado de conversiones rastreadas. Especialmente efectivo en iGaming y plataformas de suscripción.

## Las métricas que importan (y las que no)

Muchas marcas llegan al gaming marketing mirando el número de seguidores. Error. Las métricas que determinan el valor real de un creador son:

Espectadores medios concurrentes en directo: indica cuántas personas están viendo el contenido en tiempo real. Este número es mucho más relevante que el total de seguidores acumulados a lo largo de años.

Engagement rate: ratio de interacciones (mensajes de chat, likes, comentarios) sobre el número de espectadores. Un creador con 2.000 espectadores medios y un chat muy activo puede tener más impacto que uno con 10.000 espectadores pasivos.

Tasa de retención en YouTube: qué porcentaje del vídeo ven los usuarios. Una retención del 40-50% en un vídeo de 20 minutos es excelente y señala una audiencia genuinamente interesada.

Historial de conversiones: si el creador ha hecho campañas anteriores con código rastreable, sus datos históricos de conversión son el indicador más fiable de lo que puedes esperar.

Lo que NO debes mirar como métrica principal: número total de seguidores, views totales de canal (acumuladas de años), subscribers (sin datos de retención asociados).

## Cómo elegir la agencia de marketing gaming adecuada

El ecosistema de agencias que dicen hacer gaming marketing es amplio, pero pocas tienen especialización real. Aquí los criterios que importan:

Especialización en gaming, no como servicio lateral: las agencias generalistas de influencer marketing que "también hacen gaming" rara vez tienen el conocimiento del ecosistema, los contactos directos con los creadores o la experiencia en compliance iGaming que una campaña bien ejecutada requiere.

Roster propio de talentos verificados: las mejores agencias tienen relaciones directas y contratos con los creadores, no solo acceso a plataformas de búsqueda. Eso se traduce en briefings más rápidos, contenido de mejor calidad y menos imprevistos.

Tracking de conversiones real: exige reportes con datos verificados. Si la agencia no puede mostrarte FTDs rastreados, ventas con código atribuido o CTR verificado, no es una agencia de performance gaming: es una agencia de awareness.

Conocimiento regulatorio iGaming: si tu marca opera en este vertical, la agencia tiene que conocer la regulación DGOJ y tener protocolos de compliance documentados. Más información en socialpro.es/servicios/igaming.

## Los errores más comunes en marketing gaming

Elegir creadores solo por número de seguidores sin revisar engagement ni historial de conversiones.

Lanzar campañas sin briefing de compliance para marcas de iGaming, exponiendo tanto al creador como al operador a riesgos regulatorios.

Medir el éxito solo por impresiones, ignorando las métricas de conversión que el canal permite rastrear con precisión.

No planificar el contenido evergreen de YouTube: las campañas que solo incluyen Twitch pierden el valor de largo plazo que una buena review o guía puede generar durante meses.

Tratar el gaming como un canal de publicidad convencional: la audiencia gaming detecta inmediatamente el contenido forzado o genérico. La autenticidad del creador es la principal razón por la que la audiencia confía en él —y eso no se puede comprar, solo preservar.

## Recursos para ir más lejos

El roster de talentos de SocialPro, con métricas verificadas, está disponible en socialpro.es/talentos. Los casos de éxito de campañas ejecutadas, con resultados reales, en socialpro.es/casos. Si quieres diseñar una campaña a medida, escríbenos en socialpro.es/contacto.

El marketing gaming en España está en uno de sus mejores momentos. Las marcas que entran ahora con conocimiento y ejecución correcta pueden conseguir resultados que en canales convencionales ya no son posibles.`;

const MONETIZAR_YOUTUBE_BODY = `Monetizar un canal de YouTube gaming en 2026 va mucho más allá de activar AdSense y esperar. Los creadores que realmente viven de su contenido —o que generan ingresos complementarios significativos de él— combinan varias fuentes de monetización, entienden sus métricas y, en la mayoría de los casos, trabajan con marcas a través de una agencia o gestor especializado.

Esta guía te explica todas las vías disponibles, cómo compararlas, qué buscan las marcas cuando seleccionan creadores para campañas, y cuándo tiene sentido considerar trabajar con una agencia de representación.

## AdSense: la base, no el techo

AdSense es el primer paso de monetización para casi todos los canales de YouTube. Una vez que superas los 1.000 suscriptores y las 4.000 horas de visualización en los últimos 12 meses, puedes monetizar con anuncios.

El problema es que AdSense solo es una fuente de ingresos sostenible para canales con mucho volumen. El CPM en el nicho gaming hispanohablante oscila entre 1€ y 4€ en función del mes (diciembre es el mejor, enero el peor) y del perfil de audiencia. Un canal con 100.000 visualizaciones mensuales puede generar entre 100€ y 400€ al mes de AdSense —suficiente para cubrir algún gasto de producción, pero no para vivir de ello.

AdSense tiene también una particularidad que muchos creadores ignoran: el nicho importa tanto como el volumen. Un canal de finanzas personales con 50.000 visualizaciones puede ganar más de AdSense que un canal de gaming con 200.000, porque los anunciantes pagan más por llegar a audiencias con alta intención de compra de productos financieros. En gaming, el CPM es moderado pero mejora mucho cuando la audiencia está alineada con categorías de alto CPM como hardware, software o iGaming.

## Membresías y Super Thanks: monetización directa de fans

Las membresías de YouTube (el equivalente a Twitch subscriptions) te permiten ofrecer beneficios exclusivos a cambio de una suscripción mensual. Los badges, emojis exclusivos y contenido solo para miembros son los más habituales.

La monetización por membresías requiere construir una comunidad muy fiel. Canales con 50.000 suscriptores pueden tener entre 50 y 300 miembros de pago. Con una tarifa de 2,99€/mes y 200 miembros, eso son aproximadamente 600€ brutos al mes —nada desdeñable como ingreso recurrente complementario.

Super Thanks y Super Chat (en directos) son formas de monetización de contribuciones puntuales de la audiencia. Funcionan mejor en canales con comunidad muy activa y emisiones en directo frecuentes.

## Sponsorships: el mayor potencial de ingresos

Los patrocinios de marcas son, para la mayoría de creadores con audiencia consolidada, la fuente de ingresos más significativa. Un sponsorship bien negociado puede valer entre 500€ y 10.000€+ dependiendo del tamaño del canal, el engagement y el tipo de marca.

### Qué buscan las marcas en un youtuber gaming

Las marcas que invierten en YouTube gaming en 2026 no compran seguidores: compran conversiones y brand fit. Los criterios que más pesan en la selección de creadores son:

Retención de vídeo: si tu audiencia ve de media el 45% de tus vídeos, eso significa que el mensaje de marca tiene exposición real durante varios minutos —no solo un flash de tres segundos.

Engagement en comentarios y likes: indica que la audiencia tiene una relación activa con el creador, no solo consume pasivamente.

Coherencia de la audiencia con el target de la marca: un canal de CS2 tiene una audiencia mayoritariamente masculina de 18-28 años con interés en periféricos, tecnología y posiblemente iGaming. Eso es exactamente lo que buscan las marcas de esas categorías.

Historial de campañas anteriores: si ya has hecho collaboraciones con marca y tienes datos de conversión, eso es tu activo más valioso para negociar el siguiente contrato.

### Tipos de deals disponibles para youtubers

Vídeo dedicado: el canal produce un vídeo entero sobre el producto de la marca. Es el formato más caro y el que más valor entrega a la marca. Para canales mid-tier, los precios están entre 800€ y 3.000€.

Integración en vídeo existente: la mención de la marca se integra en un vídeo de contenido regular, con una presentación de 60-90 segundos. Más barato que el vídeo dedicado, con resultados de awareness similares. Precios entre 300€ y 1.500€ para mid-tier.

Código de referido permanente: la marca te da un código propio para mencionar en tus vídeos cuando sea relevante. Genera ingresos recurrentes vinculados a conversiones. Especialmente habitual en iGaming, herramientas gaming y servicios de suscripción.

## Cómo preparar un media kit que convenza a las marcas

El media kit es tu propuesta de valor en papel. Para un youtuber gaming, debe incluir:

Datos del canal: suscriptores, visualizaciones mensuales, retención media, porcentaje de audiencia hispanohablante.

Perfil demográfico de tu audiencia: edad, género, países principales. Esta información está en YouTube Studio y es esencial para el pitch.

Ejemplos de contenido: los 2-3 vídeos que mejor representan tu estilo y los que mejores métricas han tenido.

Collaboraciones anteriores: marcas con las que has trabajado, con resultados si los tienes y si la confidencialidad del contrato lo permite.

Tarifario orientativo: un rango de precios por tipo de formato. No tienes que ser exacto —es una conversación, no un precio fijo.

El formato más efectivo es un PDF de 2-3 páginas, visual y actualizado. Canva tiene plantillas para esto, aunque lo más importante es que los datos sean reales y recientes.

## Cuándo tiene sentido trabajar con una agencia de representación

Una agencia especializada en gaming aporta tres cosas que la mayoría de creadores no pueden conseguir por su cuenta: acceso a deals que no son públicos, capacidad de negociación respaldada por volumen y gestión del compliance regulatorio cuando trabajas con marcas de iGaming.

Si estás generando ingresos consistentes de sponsorships (aunque sea modestos), llevas al menos 12 meses publicando contenido regular y tienes métricas de engagement sólidas, puede ser el momento de explorar si una agencia puede escalar tus ingresos.

La fórmula habitual es que la agencia se queda entre un 15% y un 25% de los deals que cierra para ti. La pregunta no es si puedes permitirte ese coste, sino si la agencia puede traerte deals que tú no conseguirías por tu cuenta o en mejores condiciones de las que negociarías solo.

El roster de SocialPro en socialpro.es/talentos da una idea del perfil de creadores con los que trabajamos. Si cumples ese perfil aproximado y quieres explorar una representación, puedes aplicar en socialpro.es/para-creadores.

## El siguiente paso

La monetización de un canal de YouTube gaming es un proceso acumulativo. AdSense primero, membresías cuando la comunidad tiene suficiente fidelidad, sponsorships cuando las métricas lo justifican, y agencia cuando el volumen de deals lo hace eficiente.

No hay atajos, pero sí hay un camino claro: publica contenido consistente, construye métricas reales, documenta tus resultados con marcas desde el primer deal, y usa esos datos para mejorar en cada negociación siguiente.`;

// ─── Script ───────────────────────────────────────────────────────────────────

const NEW_POSTS = [
  {
    slug: 'regulaciones-igaming-espana-streamers',
    title: 'Regulaciones iGaming España: guía para streamers y creadores',
    excerpt:
      'Todo lo que necesitas saber sobre la regulación del juego online en España antes de aceptar una campaña iGaming: qué puedes decir, qué está prohibido y cómo funciona el compliance.',
    bodyMd: REGULACIONES_IGAMING_BODY,
    author: 'SocialPro',
    // draft until legal review
    status: 'draft' as const,
    sortOrder: 10,
  },
  {
    slug: 'guia-marketing-gaming-espana-2026',
    title: 'Guía completa de marketing gaming en España 2026',
    excerpt:
      'Estado del mercado, plataformas, tipos de campaña, métricas que importan y cómo elegir agencia. Todo lo que necesitas saber sobre marketing gaming España 2026.',
    bodyMd: GUIA_MARKETING_GAMING_BODY,
    author: 'SocialPro',
    status: 'published' as const,
    publishedAt: new Date('2026-04-03'),
    sortOrder: 11,
  },
  {
    slug: 'monetizar-canal-youtube-gaming-2026',
    title: 'Cómo monetizar tu canal de YouTube gaming en 2026',
    excerpt:
      'AdSense, membresías, sponsorships y agencias de representación: todas las vías para monetizar un canal de YouTube gaming y cómo comparar cada opción según tu tamaño y objetivos.',
    bodyMd: MONETIZAR_YOUTUBE_BODY,
    author: 'SocialPro',
    status: 'published' as const,
    publishedAt: new Date('2026-04-03'),
    sortOrder: 12,
  },
];

async function main() {
  for (const post of NEW_POSTS) {
    const result = await db
      .insert(schema.posts)
      .values(post)
      .onConflictDoNothing()
      .returning({ id: schema.posts.id, slug: schema.posts.slug });

    if (result.length === 0) {
      console.log(`⚠  Already exists (skipped): ${post.slug}`);
    } else {
      const words = post.bodyMd.split(/\s+/).length;
      console.log(`✓  Inserted "${post.slug}" — ${words} words [${post.status}]`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
