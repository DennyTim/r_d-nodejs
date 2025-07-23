# Distributed Chat – NestJS + RxJS

Monorepo containing:

* **server/** – NestJS v10 backend (REST + WebSocket)  
* **client/** – React + RxJS demo client (Vite)  
* **load-balancer/** – Nginx config used by *docker‑compose* to spread HTTP + WS traffic  
* **docker-compose.yml** – dev orchestration: `N` server instances, Redis and LB

```bash
pnpm i              # installs root + workspaces
pnpm dev            # starts redis, 2× server, LB, client (live‑reload)
pnpm build          # production build (client + server)
pnpm start:prod     # production compose up
```

> After verifying the baseline implementation you can delete parts you want your students to finish – every **TODO:** is a good starting point.
