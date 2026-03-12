# Guia de Deploy Unificado - SaaS Restaurante Demo 🚀

Para facilitar a sua vida, eu unifiquei o projeto! Agora o **Backend serve o Frontend**. Isso significa que você só precisa de **UM** serviço no Render para rodar tudo.

## 1. Banco de Dados (Supabase)
O banco de dados já foi inicializado por mim no Supabase que você informou. Todas as tabelas e dados iniciais (admin/senha 123456) estão prontos.

## 2. Deploy Único (Render - Web Service)
1. Crie um novo **Web Service** no Render.
2. Conecte o repositório da pasta `sass-restaurante-demo`.
3. Configure o comando de Build e Start:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Adicione as **Environment Variables**:
   - `DATABASE_URL`: (URL do Supabase que você me passou)
   - `JWT_SECRET`: `qualquer-chave-secreta`
   - `VITE_API_URL`: `/api` (Isso é importante! Como estão no mesmo lugar, basta usar /api)

---
**Vantagem**: Você economiza créditos do Render e não precisa gerenciar dois links diferentes. O link que o Render te der para o Web Service já vai abrir o site direto no navegador!
