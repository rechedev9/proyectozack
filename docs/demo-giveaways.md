# Demo: Creator Giveaways

**Creado:** 2026-03-20
**Propósito:** Demo visual para clientes — sorteos de creadores con estética gaming/casino

## Datos de demo en la DB

19 giveaways insertados manualmente en la tabla `giveaways` (no via seed script).

| Creador | talent_id | Activos | Finalizados |
|---|---|---|---|
| TODOCS2 | 1 | 7 | 6 |
| DEQIUV | 2 | 2 | 0 |
| ADAMS | 3 | 1 | 0 |
| MECHA ALVAREZ | 4 | 1 | 0 |
| HUASOPEEK | 5 | 1 | 0 |
| RINNA | 6 | 1 | 0 |

## Para limpiar los datos de demo

```sql
DELETE FROM giveaways;
```

## URLs de demo

- http://localhost:3000/creadores/todocs2 (principal, 13 giveaways)
- http://localhost:3000/creadores/deqiuv
- http://localhost:3000/creadores/adams
- http://localhost:3000/creadores/mecha
- http://localhost:3000/creadores/huasopeek
- http://localhost:3000/creadores/rinna

## Imágenes

Todas las skins usan `steamcdn-a.akamaihd.net` — misma fuente que zevocs2.com. No hay imágenes locales.

## Notas

- Los giveaways "activos" expirarán naturalmente (ends_at es relativo a la fecha de inserción)
- Para renovar la demo, borrar y reinsertar con fechas frescas
- El `redirect_url` de todos apunta a dominios ejemplo (csgoempire, gamdom, clash.gg, etc.)
