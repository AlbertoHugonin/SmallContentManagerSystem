# Deploy dietro reverse proxy Nginx in LAN

Questo stack pubblica solo il frontend sulla porta `FRONTEND_PORT` della macchina applicativa.
Il frontend Nginx serve la SPA React e inoltra internamente al backend Express le richieste verso `/api/` e `/images/`.

## Macchina applicativa

1. Copiare il file di esempio:

   ```sh
   cp deploy/.env.example deploy/.env
   ```

2. Modificare `deploy/.env`:

   ```env
   FRONTEND_PORT=8080
   PUBLIC_ORIGIN=http://contentmanager.local
   SESSION_SECRET=replace-with-a-long-random-secret
   SESSION_COOKIE_SECURE=false
   ```

   Se il reverse proxy esterno espone il sito in HTTPS, usare:

   ```env
   PUBLIC_ORIGIN=https://contentmanager.example.com
   SESSION_COOKIE_SECURE=true
   ```

3. Avviare lo stack:

   ```sh
   docker compose --env-file deploy/.env -f deploy/stack.yml up -d --build
   ```

## Macchina Nginx esterna

Usare `deploy/nginx-reverse-proxy.example.conf` come base e sostituire:

- `192.168.1.50` con l'IP LAN della macchina applicativa.
- `8080` con `FRONTEND_PORT`, se cambiata.
- `contentmanager.local` con il dominio o hostname usato dai client.

Il proxy esterno deve inoltrare tutte le richieste verso `http://IP_MACCHINA_APP:FRONTEND_PORT`.
