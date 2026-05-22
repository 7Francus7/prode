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
