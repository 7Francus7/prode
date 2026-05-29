# Deploy Checklist

## 1. Variables de entorno

Configura estas variables en local y en Vercel:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CRON_SECRET`
- `PAYMENT_ALIAS`
- `PAYMENT_CBU`
- `PAYMENT_OWNER`
- `PAYMENT_BANK`
- `INSCRIPTION_AMOUNT`
- `NEXT_PUBLIC_LOCK_DATE`

Opcionales pero recomendadas:

- `FOOTBALL_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

Genera VAPID con:

```bash
npm run push:keys
```

Verifica el entorno antes de deployar:

```bash
npm run deploy:check
```

## 2. Base de datos

Empuja el schema:

```bash
npm run db:push
```

Carga grupos, equipos y partidos:

```bash
npm run db:seed
```

## 3. Usuario admin

Crea o asciende tu usuario:

```bash
npm run admin:make -- tu@email.com
```

## 4. Cron de sincronizacion

Hay dos modos soportados:

### Vercel native cron

- `vercel.json` apunta a `GET /api/cron/sync`
- Vercel envia `Authorization: Bearer $CRON_SECRET`
- En plan Hobby solo corre una vez por dia

### Cron externo cada 15 min

Usa `cron-job.org` o similar:

- Metodo: `POST`
- URL: `https://tu-dominio.com/api/sync`
- Header: `Authorization: Bearer TU_CRON_SECRET`
- Frecuencia: cada 15 minutos

Si queres resultados mas frescos durante el Mundial, usa cron externo o Vercel Pro.

## 5. Verificacion final

Antes de compartir:

```bash
npm run build
npm run qa:smoke
```

Checklist funcional:

- registro de usuario
- login
- gating de pago
- activacion de pago desde admin
- guardado de predicciones
- ranking visible
- perfil editable
- fixture visible
- sync manual desde admin

## 6. Runbook Mundial 2026

Este bloque es para operar el prode el dia que arranca el Mundial, el 11 de junio de 2026, y durante toda la fase de grupos.

### T-7 dias

- correr `npm run deploy:check`
- correr `npx next build`
- correr `npm run qa:smoke`
- confirmar que `FOOTBALL_API_KEY` y `CRON_SECRET` esten cargadas en produccion
- confirmar que el cron externo siga apuntando a `POST /api/sync` cada 15 minutos
- validar que tu usuario admin entra a `/admin/users`, `/admin/matches` y `/admin/sync`
- revisar que los partidos tengan fecha, grupo y equipos correctos en `/admin/matches`

### T-1 dia

- abrir produccion y guardar una prediccion real con un usuario de prueba pago
- abrir `/admin/sync` y ejecutar `Sync completo`
- verificar que el resultado del sync muestre contadores y no errores
- revisar que `NEXT_PUBLIC_LOCK_DATE` sea la fecha real de cierre global, si aplica
- confirmar que el fixture visible en produccion tenga horarios coherentes

### Dia 0: 11 de junio de 2026

- 2 horas antes del primer partido:
  revisar que el cron externo haya corrido en las ultimas 15 minutos
- 1 hora antes:
  abrir `/admin/matches` y ubicar el primer partido
- 15 minutos antes:
  confirmar que una prediccion todavia se puede guardar para un partido programado
- al comenzar el partido:
  confirmar que el partido pase a `LIVE` por sync o, si no paso, cambiarlo manualmente desde `/admin/matches`
- apenas quede `LIVE`:
  verificar que ya no permita editar predicciones

### Durante cada partido

- si el cron viene sano, usar `/admin/sync` > `Sync partidos en vivo`
- si ves que el partido empezo y sigue editable, entrar a `/admin/matches` y poner `status = LIVE`
- si el horario del fixture vino corrido pero el estado real ya cambio, priorizar siempre el estado real del partido
- si la API externa no devuelve cambios, no esperar al proximo cron si el partido ya arranco: actualizar manualmente

### Al terminar cada partido

- ejecutar `/admin/sync` > `Sync partidos en vivo`
- verificar que el partido quede en `FINISHED`
- verificar que tenga `homeScore` y `awayScore`
- revisar ranking o predicciones de un usuario de prueba para confirmar que sumo `1` o `0` correctamente
- si el partido termino y no se calcularon puntos, aplicar plan B manual

### Plan B manual por partido

Usar este flujo si falla la API, falla el cron o el resultado queda inconsistente.

1. Entrar a `/admin/matches`
2. Buscar el grupo y el partido
3. Cargar `homeScore` y `awayScore` finales
4. Cambiar `status` a `FINISHED`
5. Guardar cambios
6. Verificar que el ranking o las predicciones del usuario reflejen el nuevo puntaje

Ese guardado manual dispara dos cosas:

- limpia puntos previos del partido si existian
- recalcula los puntos correctos para ese partido

### Plan B masivo

Usar este flujo si varios partidos quedaron mal o si queres reconstruir todo desde cero sin tocar las predicciones.

1. Entrar a `/admin/sync`
2. Ejecutar `Sync completo`
3. Si los resultados ya estan bien guardados pero los puntos no cierran, ejecutar `Recalcular todos los puntos`
4. Verificar el ranking y una muestra de usuarios

### Senales de alerta

- un partido ya esta en juego pero sigue `SCHEDULED`
- un usuario todavia puede editar una prediccion de un partido `LIVE`
- un partido `FINISHED` no muestra score final
- el ranking no cambia despues de terminar un partido
- `Sync completado` devuelve errores en `/admin/sync`

### Respuesta rapida ante alerta

- problema de cierre:
  ir a `/admin/matches` y pasar el partido a `LIVE`
- problema de resultado:
  cargar score final manual y marcar `FINISHED`
- problema de puntos:
  ejecutar `Recalcular todos los puntos`
- problema de cron:
  seguir operando desde `/admin/sync` y `/admin/matches` hasta restaurarlo
