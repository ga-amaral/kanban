# AutoKanban API Fix - Endpoints Online (Vercel)

## ✅ Diagnóstico Completo
- [x] Identificado problema: server.ts usa anon key pública em vez de service_role
- [x] Confirmado padrão em todos endpoints (card/column/workspace)
- [x] Vercel deployment confirmado
- [x] DB funcionando normalmente

## 🔧 Implementação
- [ ] 1. Fix `src/lib/supabase/server.ts` (env vars + validação)
- [ ] 2. Update `README.md` (Vercel env vars docs)
- [ ] 3. Test local: `npm run dev`
- [ ] 4. User: Add env vars in Vercel dashboard
- [ ] 5. Git push → Vercel redeploy
- [ ] 6. Test endpoints online

## 📋 Vercel Env Vars Necessárias
```
SUPABASE_URL=https://*.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (Supabase Settings → API → service_role)
