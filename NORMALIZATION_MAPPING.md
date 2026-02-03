# Mapeamento de Normalização - Português

Este documento mapeia todas as mudanças de nomenclatura de Inglês → Português.

## Controllers

| Actual (Inglês) | Normalizado (Português) | Status |
|-----------------|-------------------------|--------|
| MembersController | MembrosController | ✅ JÁ FEITO |
| MemberDocumentController | DocumentosMembrosController | ❌ PENDENTE |
| MemberRelationshipController | RelacoesMembroController | ❌ PENDENTE |
| EventsController | EventosController | ❌ PENDENTE |
| SportsController | DesportivoController | ❌ PENDENTE |
| FinancialController | FinanceiroController | ❌ PENDENTE |
| TransactionController | TransacoesController | ❌ PENDENTE |
| MembershipFeeController | TaxasController | ❌ PENDENTE |
| FinancialCategoryController | CategoriasFinanceirasController | ❌ PENDENTE |
| FinancialReportController | RelatoriosFinanceirosController | ❌ PENDENTE |
| ShopController | LojaController | ❌ PENDENTE |
| SponsorshipsController | PatrocinosController | ❌ PENDENTE |
| ComunicacaoController | ComunicacaoController | ✅ JÁ FEITO |
| MarketingCampaignController | CampanhasMarketingController | ❌ PENDENTE |
| TeamController | EquipasController | ❌ PENDENTE |
| TeamMemberController | MembrosEquipaController | ❌ PENDENTE |
| TrainingSessionController | SessoesFormacaoController | ❌ PENDENTE |
| CallUpController | ConvocatoriasController | ❌ PENDENTE |
| SettingsController | ConfiguracoesController | ❌ PENDENTE |

## Routes

| Actual | Normalizado | Status |
|--------|-------------|--------|
| /members | /membros | ❌ PENDENTE |
| /members/{id}/documents | /membros/{id}/documentos | ❌ PENDENTE |
| /members/{id}/relationships | /membros/{id}/relacoes | ❌ PENDENTE |
| /events | /eventos | ❌ PENDENTE |
| /sports | /desportivo | ❌ PENDENTE |
| /financial | /financeiro | ❌ PENDENTE |
| /financial/transactions | /financeiro/transacoes | ❌ PENDENTE |
| /financial/membership-fees | /financeiro/taxas | ❌ PENDENTE |
| /financial/categories | /financeiro/categorias | ❌ PENDENTE |
| /financial/reports | /financeiro/relatorios | ❌ PENDENTE |
| /shop | /loja | ❌ PENDENTE |
| /sponsorships | /patrocinios | ❌ PENDENTE |
| /communication | /comunicacao | ❌ PENDENTE |
| /marketing | /campanhas-marketing | ❌ PENDENTE |
| /teams | /equipas | ❌ PENDENTE |
| /team-members | /membros-equipa | ❌ PENDENTE |
| /training-sessions | /sessoes-formacao | ❌ PENDENTE |
| /call-ups | /convocatorias | ❌ PENDENTE |
| /settings | /configuracoes | ❌ PENDENTE |

## Pages (Inertia)

| Actual | Normalizado | Status |
|--------|-------------|--------|
| Pages/Members/ | Pages/Membros/ | ✅ JÁ EXISTE |
| Pages/Events/ | Pages/Eventos/ | ❌ PENDENTE |
| Pages/Sports/ | Pages/Desportivo/ | ❌ PENDENTE |
| Pages/Financial/ | Pages/Financeiro/ | ❌ PENDENTE |
| Pages/Shop/ | Pages/Loja/ | ❌ PENDENTE |
| Pages/Sponsorships/ | Pages/Patrocinios/ | ❌ PENDENTE |
| Pages/Communication/ | Pages/Comunicacao/ | ❌ PENDENTE |
| Pages/Marketing/ | Pages/CampanhasMarketing/ | ❌ PENDENTE |
| Pages/Settings/ | Pages/Configuracoes/ | ❌ PENDENTE |

## Models - Campos Duplicados (User)

⚠️ **CRÍTICO**: Model User tem campos em INGLÊS e PORTUGUÊS simultaneamente!

| Campo Inglês | Campo Português | Ação Necessária |
|--------------|-----------------|-----------------|
| member_type | tipo_membro | ⚠️ REMOVER inglês, manter português |
| member_number | numero_socio | ⚠️ REMOVER inglês |
| full_name | nome_completo | ⚠️ REMOVER inglês |
| profile | perfil | ⚠️ REMOVER inglês |
| status | estado | ⚠️ REMOVER inglês |
| birth_date | data_nascimento | ⚠️ REMOVER inglês |
| is_minor | menor | ⚠️ REMOVER inglês |
| gender | sexo | ⚠️ REMOVER inglês |
| age_groups | escalao | ⚠️ REMOVER inglês |
| gdpr_consent | rgpd | ⚠️ REMOVER inglês |
| consent | consentimento | ⚠️ REMOVER inglês |
| affiliation | afiliacao | ⚠️ REMOVER inglês |
| transport_declaration | declaracao_de_transporte | ⚠️ REMOVER inglês |
| sports_active | ativo_desportivo | ⚠️ REMOVER inglês |
| address | morada | ⚠️ REMOVER inglês |
| postal_code | codigo_postal | ⚠️ REMOVER inglês |
| city | localidade | ⚠️ REMOVER inglês |
| phone | contacto | ⚠️ REMOVER inglês |
| mobile | telemovel | ⚠️ REMOVER inglês |

## API Controllers

| Actual | Normalizado | Status |
|--------|-------------|--------|
| Api/UserTypeController | Api/TiposUtilizadorController | ❌ PENDENTE |
| Api/AgeGroupController | Api/EscaloesController | ❌ PENDENTE |
| Api/CostCenterController | Api/CentrosCustoController | ❌ PENDENTE |
| Api/EventTypeController | Api/TiposEventoController | ❌ PENDENTE |

## Route Names (utilizados em route() helper)

| Actual | Normalizado |
|--------|-------------|
| members.index | membros.index |
| members.show | membros.show |
| members.create | membros.create |
| members.store | membros.store |
| members.edit | membros.edit |
| members.update | membros.update |
| members.destroy | membros.destroy |
| events.* | eventos.* |
| sports.* | desportivo.* |
| financial.* | financeiro.* |
| shop.* | loja.* |
| sponsorships.* | patrocinios.* |
| communication.* | comunicacao.* |
| marketing.* | campanhas-marketing.* |
| teams.* | equipas.* |
| call-ups.* | convocatorias.* |
| settings.* | configuracoes.* |

## Notas Importantes

### Breaking Changes
⚠️ Estas mudanças vão quebrar:
- URLs existentes (ex: `/members` → `/membros`)
- Route names em todo código frontend
- Links externos/favoritos salvos
- Qualquer integração externa

### Estratégia de Migração
- Adicionar redirects permanentes das rotas antigas para novas
- Atualizar toda documentação
- Comunicar mudanças aos utilizadores

### Ordem de Implementação
1. ✅ Criar este documento de mapeamento
2. ⏳ Renomear Controllers + atualizar namespaces
3. ⏳ Atualizar routes/web.php
4. ⏳ Renomear diretórios Pages/
5. ⏳ Limpar campos duplicados do User model
6. ⏳ Atualizar todas referências route() no código
7. ⏳ Adicionar redirects para retrocompatibilidade
8. ⏳ Validar end-to-end
