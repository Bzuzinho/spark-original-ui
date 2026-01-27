# Separador Desportivo - Guia de Uso

## ✅ Correção Aplicada

**Problema identificado e resolvido:** O separador Desportivo não aparecia dinamicamente ao marcar "Atleta" - era necessário guardar e reabrir o perfil.

**Solução implementada:** O separador agora aparece/desaparece instantaneamente ao marcar/desmarcar a checkbox "Atleta", sem necessidade de guardar primeiro.

---

## Como fazer o separador "Desportivo" aparecer

O separador **Desportivo** aparece automaticamente quando um utilizador tem o tipo de membro **"Atleta"** selecionado.

### Passos para ativar o separador Desportivo:

1. **Aceder ao perfil do utilizador**
   - Ir para "Membros"
   - Selecionar o utilizador desejado

2. **Na aba "Pessoal"**
   - Encontrar a secção "Tipo de Membro *"
   - Marcar a checkbox **"Atleta"**
   - ✨ **O separador "Desportivo" aparece imediatamente!**

3. **Guardar as alterações** (para persistir os dados)
   - Clicar no botão "Guardar" no topo da página

4. **Usar o separador**
   - Clicar no separador "Desportivo" para preencher informações desportivas
   - Todos os campos ficam disponíveis instantaneamente

## Exemplo Visual

```
Separadores SEM atleta marcado:
┌─────────┬────────────┬──────────────┐
│ Pessoal │ Financeiro │ Configuração │
└─────────┴────────────┴──────────────┘

Separadores COM atleta marcado:
┌─────────┬────────────┬────────────┬──────────────┐
│ Pessoal │ Financeiro │ Desportivo │ Configuração │
└─────────┴────────────┴────────────┴──────────────┘
```

## Utilizadores com Múltiplos Tipos

Um utilizador pode ter múltiplos tipos de membro simultaneamente. Por exemplo:
- ✅ Atleta + Treinador
- ✅ Atleta + Sócio
- ✅ Encarregado de Educação + Atleta

**Importante:** O separador Desportivo aparece **apenas** se "Atleta" estiver selecionado, independentemente dos outros tipos marcados.

## Utilizador Admin Inicial

O utilizador admin criado automaticamente (`admin@bscn.pt`) **não tem** nenhum tipo de membro selecionado por padrão. Para ver o separador Desportivo:

1. Login como admin
2. Ir para Membros
3. Selecionar "Administrador"
4. Na aba Pessoal, marcar "Atleta"
5. Guardar

## Conteúdo do Separador Desportivo

Quando o separador está visível, contém os seguintes campos:

### Identificação Desportiva
- **Número de Federação**: Número de registo na federação
- **Cartão de Federação**: Upload do cartão de federação (com pré-visualização)
- **Número PMB**: Número do Processo de Mobilidade Bancária

### Datas e Inscrições
- **Data de Inscrição**: Data de entrada no clube
- **Inscrição**: Tipo de inscrição
- **Escalões**: Escalões desportivos (seleção múltipla)

### Saúde Desportiva
- **Data do Atestado Médico**: Validade do atestado
- **Arquivo do Atestado Médico**: Upload de múltiplos ficheiros
- **Informações Médicas**: Campo de texto livre para condições, alergias, etc.

### Estado Desportivo
- **Ativo Desportivo**: Switch para indicar se está ativo desportivamente

## Resolução de Problemas

### O separador Desportivo não aparece?

**Após a correção, o separador aparece instantaneamente. Se ainda não aparecer:**

**Checklist:**
1. ✅ O utilizador tem "Atleta" marcado em Tipo de Membro?
2. ✅ A checkbox está visualmente marcada (com tick)?
3. ✅ Tente desmarcar e marcar novamente
4. ✅ Verifique se não há erros no console do browser (F12)

### Perdi o acesso ao separador Desportivo?

Se desmarcou "Atleta" acidentalmente:
1. Os dados do separador Desportivo **não são apagados**
2. Voltam a aparecer quando marcar "Atleta" novamente
3. Todos os campos ficam preservados

### Comportamento Esperado

- ✅ Marcar "Atleta" → Separador aparece instantaneamente
- ✅ Desmarcar "Atleta" → Separador desaparece instantaneamente
- ✅ Marcar outros tipos (Treinador, Sócio, etc.) → Não afeta o separador Desportivo
- ✅ Dados desportivos preservados mesmo quando separador está oculto

## Notas Técnicas

- **Visibilidade Dinâmica**: O separador agora responde instantaneamente às mudanças no tipo de membro
- **Campo obrigatório**: Pelo menos um tipo de membro deve estar selecionado
- **Persistência**: Os dados desportivos são preservados mesmo quando "Atleta" é desmarcado
- **Validação**: O sistema não permite guardar sem pelo menos um tipo de membro selecionado
- **Correção aplicada**: Movido o cálculo de `showSportsTab` para dentro do corpo de renderização para reatividade completa

## Changelog de Correções

**2025-01-XX - v1.1**
- ✅ Corrigido: Separador Desportivo agora aparece/desaparece dinamicamente
- ✅ Removido: Necessidade de guardar e reabrir perfil para ver o separador
- ✅ Melhorado: Experiência do utilizador mais fluida e responsiva

---

**Última atualização:** 2025-01-XX
**Versão do sistema:** 1.1
