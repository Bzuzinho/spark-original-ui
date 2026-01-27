# Integração de Envio de Emails Reais

## Visão Geral

O sistema agora possui integração completa com serviços externos de envio de emails reais, permitindo o envio de comunicações automáticas e manuais para membros do clube.

## Serviços Suportados

### 1. Resend (Recomendado) ⭐
- **Plano Gratuito**: 3.000 emails/mês
- **Facilidade**: Muito simples de configurar
- **Website**: https://resend.com
- **Documentação**: https://resend.com/docs

**Por que escolher?**
- Setup mais rápido
- Interface limpa e moderna
- Excelente para desenvolvedores
- API muito simples

### 2. SendGrid
- **Plano Gratuito**: 100 emails/dia
- **Website**: https://sendgrid.com
- **Documentação**: https://docs.sendgrid.com

### 3. Mailgun
- **Plano Gratuito**: 5.000 emails/mês (primeiros 3 meses)
- **Website**: https://mailgun.com
- **Documentação**: https://documentation.mailgun.com

## Como Configurar

### Passo 1: Escolha o Provedor

Navegue para: **Comunicação > Configuração**

### Passo 2: Configuração Rápida com Resend

1. **Criar Conta Gratuita**
   - Acesse https://resend.com
   - Crie uma conta com o seu email
   - Confirme o email de verificação

2. **Adicionar Domínio**
   - No painel Resend, vá para "Domains"
   - Clique em "Add Domain"
   - Adicione o seu domínio (ex: bscn.pt)
   - Adicione os registos DNS fornecidos no seu provedor de domínios
   - Aguarde verificação (pode demorar até 24h)
   
   **OU use o domínio de teste:**
   - Se não tiver domínio próprio, use: `onboarding@resend.dev`
   - Limitado mas funcional para testes

3. **Criar API Key**
   - No painel Resend, vá para "API Keys"
   - Clique em "Create API Key"
   - Dê um nome (ex: "BSCN Production")
   - Selecione permissões: "Sending access"
   - Copie a chave (começa com `re_...`)
   - **IMPORTANTE**: Guarde a chave em local seguro, só aparece uma vez!

4. **Configurar no Sistema**
   - Provedor: Selecione "Resend"
   - Chave de API: Cole a chave copiada
   - Email do Remetente: `noreply@seudomain.com` (ou o email verificado)
   - Nome do Remetente: `BSCN - Benedita Sport Clube Natação`
   - Clique em "Guardar Configuração"
   - Clique em "Testar" para validar

### Passo 3: Verificar Configuração

Após guardar, clique no botão **"Testar"** para enviar um email de teste para o email configurado como remetente. Se receber o email, está tudo pronto!

## Como Usar

### Envio Manual

1. Navegue para **Comunicação > Envios Manuais**
2. Clique em **"Nova Comunicação"**
3. Preencha:
   - **Assunto**: Título do email
   - **Mensagem**: Conteúdo (será formatado automaticamente)
   - **Destinatários**: Use filtros ou selecione manualmente
4. Opções:
   - **Enviar imediatamente**: O email será enviado agora
   - **Agendar envio**: Escolha data e hora para envio futuro
5. Clique em **"Enviar"**

O sistema mostrará o progresso do envio em tempo real.

### Envio Automático

1. Navegue para **Comunicação > Automáticas**
2. Clique em **"Nova Automática"**
3. Use um template pré-configurado ou crie o seu próprio:

**Templates Disponíveis:**

#### Mensalidade Vencida
- Envia alerta automático quando mensalidade está em atraso
- Configure: número de dias de atraso para disparar
- Variáveis disponíveis:
  - `{{NOME_ATLETA}}` - Nome do destinatário
  - `{{MES_VENCIMENTO}}` - Mês da mensalidade
  - `{{DIAS_ATRASO}}` - Dias em atraso
  - `{{VALOR_DEVIDO}}` - Valor em dívida
  - `{{NOME_CLUBE}}` - Nome do clube

#### Atestado Médico a Expirar
- Lembra atletas sobre atestado médico próximo da validade
- Configure: número de dias antes da expiração
- Variáveis disponíveis:
  - `{{NOME_ATLETA}}` - Nome do atleta
  - `{{DATA_EXPIRACAO}}` - Data de expiração
  - `{{DIAS_RESTANTES}}` - Dias restantes
  - `{{NOME_CLUBE}}` - Nome do clube

### Histórico

Todos os emails enviados ficam registados em **Comunicação > Histórico** com:
- Status de envio (Enviada/Falhada)
- Lista de destinatários
- Data e hora de envio
- Conteúdo completo

## Funcionalidades Avançadas

### Template HTML Automático

Todos os emails são automaticamente formatados com um template HTML profissional que inclui:
- Header com logo do clube
- Formatação de texto adequada
- Footer com informações de contacto
- Responsivo (funciona em mobile)

### Envio em Lote

Quando envia para múltiplos destinatários:
- O sistema envia um email individual para cada destinatário
- Mostra progresso em tempo real
- Continua mesmo se alguns emails falharem
- Reporta estatísticas no final (X enviados, Y falhados)

### Variáveis Dinâmicas

Use variáveis no template para personalizar emails:
```
Caro/a {{NOME_ATLETA}},

A sua mensalidade de {{MES_VENCIMENTO}} está em atraso há {{DIAS_ATRASO}} dias.
Valor devido: {{VALOR_DEVIDO}}€

Cumprimentos,
{{NOME_CLUBE}}
```

## Estrutura Técnica

### Arquitetura

```
src/lib/email-service.ts
├── EmailService (Singleton)
│   ├── loadConfig() - Carrega configuração
│   ├── saveConfig() - Guarda configuração
│   ├── isConfigured() - Verifica se está configurado
│   ├── sendEmail() - Envia email individual
│   ├── sendBulkEmails() - Envia múltiplos emails
│   ├── testConfiguration() - Testa configuração
│   └── generateHtmlFromTemplate() - Gera HTML

src/components/EmailConfig.tsx
└── Componente de configuração visual

src/views/CommunicationView.tsx
└── Interface completa de comunicação
```

### Armazenamento

As configurações de email são armazenadas de forma segura usando o `spark.kv` na chave:
- `email-config` - Configuração do serviço de email

### APIs Utilizadas

**Resend API:**
```typescript
POST https://api.resend.com/emails
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "from": "BSCN <noreply@bscn.pt>",
  "to": ["atleta@example.com"],
  "subject": "Assunto",
  "html": "<html>...</html>",
  "text": "Versão texto"
}
```

**SendGrid API:**
```typescript
POST https://api.sendgrid.com/v3/mail/send
Authorization: Bearer {API_KEY}
```

**Mailgun API:**
```typescript
POST https://api.mailgun.net/v3/{domain}/messages
Authorization: Basic api:{API_KEY}
```

## Segurança

### Boas Práticas Implementadas

1. **API Keys Protegidas**
   - Chaves são armazenadas de forma segura
   - Não são expostas no código frontend
   - Campo de password oculta a chave

2. **Validação de Email**
   - Verifica formato de email antes de enviar
   - Valida destinatários existem e têm email

3. **Rate Limiting**
   - Delay de 200ms entre emails para evitar sobrecarga
   - Respeita limites dos provedores

4. **Tratamento de Erros**
   - Captura e reporta erros específicos
   - Continua processo mesmo se alguns emails falharem
   - Logs detalhados de erros

## Limites e Quotas

### Resend (Plano Gratuito)
- 3.000 emails/mês
- 100 emails/dia
- 1 domínio

### SendGrid (Plano Gratuito)
- 100 emails/dia
- Sem limite de domínios

### Mailgun (Primeiros 3 meses gratuitos)
- 5.000 emails/mês
- Depois: paga conforme uso

## Troubleshooting

### Email não chega

1. **Verifique Spam/Lixo**
   - Emails automáticos podem ir para spam
   - Marque como "Não é spam" para futuros emails

2. **Verifique Configuração**
   - Email remetente deve estar verificado no provedor
   - API Key deve ter permissões corretas
   - Use o botão "Testar" para diagnosticar

3. **Verifique Domínio**
   - Se usar domínio próprio, DNS deve estar configurado
   - Pode demorar até 24h para propagar
   - Use domínio de teste enquanto aguarda

### Erro "Email não configurado"

- Vá para **Comunicação > Configuração**
- Complete todos os campos obrigatórios
- Clique em "Guardar" e depois em "Testar"

### Erro "API Key inválida"

- Verifique se copiou a chave completa
- Chave Resend começa com `re_`
- Chave SendGrid começa com `SG.`
- Chave Mailgun começa com `key-`
- Gere uma nova chave se necessário

### Alguns emails falham

- Verifique se os emails dos destinatários estão corretos
- Emails inválidos serão rejeitados pelo provedor
- Consulte o histórico para ver detalhes dos erros

## Próximos Passos

Para expandir a funcionalidade:

1. **Attachments**: Adicionar suporte para anexos
2. **Métricas**: Tracking de abertura e cliques
3. **Templates Visuais**: Editor WYSIWYG para emails
4. **Agendamento Automático**: Cron job para emails agendados
5. **Segmentação Avançada**: Mais filtros de destinatários

## Suporte

Para problemas ou dúvidas:
1. Consulte esta documentação primeiro
2. Verifique os logs do browser (F12 > Console)
3. Teste a configuração usando o botão "Testar"
4. Consulte documentação do provedor escolhido

## Links Úteis

- **Resend**: https://resend.com/docs
- **SendGrid**: https://docs.sendgrid.com
- **Mailgun**: https://documentation.mailgun.com
- **Email Template Best Practices**: https://www.emailonacid.com/blog/article/email-development/
