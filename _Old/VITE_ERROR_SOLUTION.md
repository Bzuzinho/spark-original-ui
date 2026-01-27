# Solução Definitiva para o Erro de Módulo Vite

## Erro
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Causa
Este erro ocorre quando:
1. Cache do Vite está corrompida
2. Instalação dos módulos Node está incompleta
3. Conflitos na resolução de módulos ESM

## Solução Aplicada

### 1. Simplificação do vite.config.ts
- Removida complexidade desnecessária (fileURLToPath, dirname, etc.)
- Usado path.resolve padrão do Node.js
- Removidas opções avançadas que podem causar conflitos

### 2. Configuração Limpa
O vite.config.ts agora usa uma abordagem mais simples e confiável:
- Plugins essenciais apenas
- Alias simples para '@'
- Configurações mínimas de servidor

### 3. Scripts de Recuperação
Use os seguintes comandos em caso de erro:

```bash
# Limpar cache
npm run clean

# Limpar tudo e reinstalar (solução mais completa)
npm run reinstall

# Se o problema persistir, limpar manualmente:
rm -rf .vite node_modules/.vite node_modules/.cache
rm -rf node_modules package-lock.json
npm install
```

## Prevenção
- Não modificar vite.config.ts sem necessidade
- Manter a configuração simples
- Limpar cache regularmente durante desenvolvimento intenso

## Status
✅ Configuração otimizada
✅ Cache será reconstruída automaticamente
✅ Sistema deve funcionar normalmente após próximo start
