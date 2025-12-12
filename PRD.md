# Planning Guide

Sistema completo de gestão de clube desportivo (BSCN) que permite a administradores e encarregados de educação gerir perfis de atletas, registos financeiros, dados de desempenho desportivo integrados, eventos, patrocínios, inventário e comunicações num sistema centralizado onde o Módulo Desportivo funciona como cérebro das atividades desportivas e liga-se diretamente ao módulo financeiro para análise de investimento vs performance.

**Experience Qualities**:
1. **Professional** - The interface should inspire confidence through clear organization and data presentation suitable for administrative work
2. **Integrated** - Sports data, user profiles, and financial information work together seamlessly with bidirectional sync and cross-module reporting
3. **Comprehensive** - All critical information organized into logical sections that reduce cognitive load while maintaining completeness

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Sistema multi-utilizador com acesso baseado em perfis, relações extensivas de dados entre utilizadores (encarregados/atletas), controlo financeiro integrado com dados desportivos, gestão de eventos, planeamento de treinos em múltiplos níveis (épocas/macrociclos/mesociclos), competições com geração automática de faturas, relatórios cruzados de peso financeiro vs desportivo, e gestão documental através de múltiplos módulos interconectados.

## Essential Features

### Dashboard Central
- **Functionality**: Visão geral com estatísticas principais, próximos eventos e atividade recente
- **Purpose**: Fornecer acesso rápido a informação crítica e navegação para módulos principais
- **Trigger**: Login do utilizador ou navegação para início
- **Progression**: Login → Dashboard → Visualizar Cards de Estatísticas → Aceder Módulos ou Ver Listas Rápidas
- **Success criteria**: Estatísticas atualizadas em tempo real, navegação fluída entre módulos, dados agregados corretos

### User Profile Management with Tabbed Interface
- **Functionality**: Perfil completo de utilizador/atleta com 4 secções (Pessoal, Financeiro, Desportivo, Configuração). Utilizadores podem ter múltiplos tipos de membro simultaneamente (ex: atleta + treinador)
- **Purpose**: Centralizar toda a informação de membros com controlos de acesso apropriados por perfil
- **Trigger**: Admin navega para lista de utilizadores e seleciona um membro; encarregado acede aos seus atletas
- **Progression**: Dashboard → Lista de Utilizadores → Selecionar Utilizador → Visualizar/Editar Tabs (Pessoal → Financeiro → Desportivo → Configuração) → Guardar Alterações → Confirmação
- **Success criteria**: Todos os campos guardam corretamente, campos condicionais aparecem/escondem baseado no tipo de utilizador, relações encarregado-atleta persistem, múltiplos tipos de membro podem ser selecionados simultaneamente

### Dynamic Guardian-Athlete Relationships
- **Functionality**: Automatic bidirectional linking when minor athletes are assigned guardians
- **Purpose**: Ensure data consistency and enable guardians to manage their dependents
- **Trigger**: Admin marks user as minor and assigns guardian, or guardian is assigned an athlete
- **Progression**: Mark as Minor → Guardian Selection Appears → Select Guardian → Guardian's Profile Auto-Updates with Athlete Link → Both Profiles Show Relationship
- **Success criteria**: Relationships sync both ways, guardians can access athlete profiles, conditional fields appear correctly

### Role-Based Field Visibility
- **Functionality**: Sports tab appears only for athletes; guardian fields appear only for minors; guardian can see athlete list. Data de nascimento pode ser editada manualmente sem uso do calendário
- **Purpose**: Reduce clutter and show only relevant information based on member type
- **Trigger**: User type selection or minor status toggle
- **Progression**: Select Member Type → System Evaluates Conditions → Shows/Hides Relevant Tabs and Fields → User Sees Only Applicable Sections
- **Success criteria**: Correct tabs/fields visible for each role, no orphaned data when switching types, date input allows manual typing

### User List with Search and Filters
- **Functionality**: Lista pesquisável e filtrável de todos os membros do clube com acesso rápido a perfis
- **Purpose**: Permitir navegação eficiente e gestão de grandes bases de dados de membros
- **Trigger**: Admin ou utilizador autorizado navega para secção de membros
- **Progression**: Abrir Membros → Ver Lista → Aplicar Filtros (Ativo/Inativo/Suspenso, Tipo de Membro) → Pesquisar por Nome/Número → Selecionar Utilizador → Abrir Perfil
- **Success criteria**: Lista carrega rapidamente, filtros funcionam corretamente, pesquisa retorna resultados relevantes, contagem de membros é exibida

### Event Management System (Central Hub for All Activities)
- **Functionality**: Criação e gestão de eventos, treinos, competições e reuniões com datas e localizações. Serves as single source of truth for all scheduled activities - treinos (tipo='treino'), competições (tipo='prova'), reuniões, estágios. Manages convocatórias, presenças, and resultados centrally
- **Purpose**: Organizar calendário do clube e manter todos informados sobre atividades. Eliminate data duplication by being the primary scheduling and attendance system
- **Trigger**: Utilizador autorizado navega para módulo de eventos, or clicks navigation links from Sports Module tabs
- **Progression**: Eventos → Ver Lista → Criar Novo → Preencher Dados (Tipo, Data, Local) → Guardar → Evento Aparece no Calendário → Appears in Sports Module filtered views → Create Convocatória → Register Presenças → Add Resultados
- **Success criteria**: Eventos são criados e listados, filtros por tipo e estado funcionam, datas são validadas, Sports Module tabs correctly show filtered event data, navigation between modules works bidirectionally

### Sports Module - Comprehensive Sports Management (Integrated with Events)
- **Functionality**: Complete sports data management system with 6 tabs (Dashboard, Planeamento, Treinos, Presenças, Competições, Relatórios). Creates training sessions that auto-generate calendar events. Manages season planning with Épocas and Macrociclos. Tracks attendance with detailed athlete-level presence registration. Views competition results linked to Events Module. Generates comprehensive financial vs performance reports
- **Purpose**: Central hub for all sports activities - planning seasons, creating workouts with technical details, managing attendance, linking to competitions, and analyzing athlete performance vs club investment
- **Trigger**: Admin or coach navigates to Sports Module
- **Progression**: Sports Module → Dashboard (view KPIs) → Planeamento (create Épocas with targets, add Macrociclos by phase) → Treinos (create training session with escalões, description, auto-creates calendar event) → Presenças (register presente/ausente/justificado for each athlete in training) → Competições (view prova-type events, navigate to Events Module to manage) → Relatórios (analyze top attendance, competition participation, financial balance per athlete)
- **Success criteria**: Training creation auto-generates events in calendar, presence registration allows individual athlete classification with statistics, competition tab correctly filters and displays prova events from Events Module, reports show integrated financial and sports data per athlete, Época creation captures season targets and KPIs, Macrociclos link to Épocas with training phases

### Sports Data Integration with User Profile (No Duplication)
- **Functionality**: User profile Sports tab displays filtered data from Events Module and Sports Module tables, not duplicate storage. Fixed fields (federation number, medical certificate) come from DadosDesportivos table. Attendance shows filtered EventoPresenca data. Training shows filtered Treino data. Results show filtered EventoResultado data
- **Purpose**: Provide athlete-specific view of sports data while maintaining single source of truth shared with Events and Sports modules
- **Trigger**: User opens athlete profile and navigates to Sports tab
- **Progression**: Open User Profile → Sports Tab → View/Edit Fixed Fields from DadosDesportivos → See Attendance Grid (filtered from evento-presencas) → See Training Grid (filtered from treinos linked to events) → See Results Grid (filtered from evento-resultados) → Click "View in Events/Sports Module" buttons to navigate with context
- **Success criteria**: No data duplication between User profile and source tables, grids show accurate filtered data from evento-presencas/treinos/evento-resultados, navigation to Events/Sports Module preserves athlete context, changes in Events/Sports reflect immediately in User Profile

### Financial Management
- **Functionality**: Registo de receitas e despesas com categorização, métodos de pagamento e análise de saldos
- **Purpose**: Controlar fluxo financeiro do clube e gerar relatórios
- **Trigger**: Admin acede ao módulo financeiro
- **Progression**: Financeiro → Ver Resumo → Registar Transação → Selecionar Tipo/Categoria → Inserir Valor/Data → Confirmar
- **Success criteria**: Transações registadas corretamente, cálculos de saldo precisos, categorização funcional

### Email Communication System (Real Email Integration)
- **Functionality**: Complete email system with real external service integration (Resend, SendGrid, Mailgun). Supports manual one-time sends and scheduled sends, automatic triggered emails (overdue payments, medical certificate expiration), bulk sending with progress tracking, HTML template generation, variable replacement for personalization
- **Purpose**: Enable professional communication with club members through automated and manual emails, reducing administrative burden and improving member engagement
- **Trigger**: Admin navigates to Communication module or automatic triggers fire based on configured rules
- **Progression**: Communication → Configuration Tab → Select Provider (Resend/SendGrid/Mailgun) → Enter API Key → Configure From Email/Name → Test → Manual Tab → New Communication → Enter Subject/Message → Select Recipients (filters or manual) → Send Immediately or Schedule → System sends emails with progress tracking → View in History
- **Success criteria**: Email configuration saves correctly and passes test, manual emails send successfully to all recipients with real-time progress, scheduled emails are stored for future sending, automatic emails trigger correctly based on rules, HTML formatting is applied automatically, error handling captures and reports failures, sent/failed statistics are accurate, email history shows all communications with full details

### Sports-Financial Integration - Competition Registrations (via Events)
- **Functionality**: Competition registrations in Events Module (convocatórias for tipo='prova' events) automatically generate financial movements/invoices linked to athlete accounts and cost centers. Sports Module Competições tab displays these events and links to Events Module for management
- **Purpose**: Seamlessly connect sports activities with financial tracking, ensuring every competition registration is properly invoiced and tracked through unified Events system
- **Trigger**: Coach creates convocatória for prova event in Events Module
- **Progression**: Events Module → Eventos tab → Create Event tipo='prova' → Convocatórias tab → Create Convocatória → Register Athletes → System Generates Movement → ConvocatoriaGrupo.movimento_id is set → Invoice appears in athlete's account → Movement inherits cost center from athlete's escalão → Sports Module Competições tab shows the same data
- **Success criteria**: Every competition convocatória creates a movimento, movimento_id is properly linked in ConvocatoriaGrupo, invoices appear in financial module, cost centers are correctly assigned, Sports Module correctly displays prova events from Events Module, reports show competition costs per athlete

### Sponsor Management
- **Functionality**: Cadastro de patrocinadores com contratos, valores e dados de contacto
- **Purpose**: Gerir relações com patrocinadores e controlar compromissos financeiros
- **Trigger**: Admin navega para módulo de patrocínios
- **Progression**: Patrocínios → Lista → Adicionar Patrocinador → Dados do Contrato → Contactos → Guardar
- **Success criteria**: Patrocinadores são cadastrados, contratos têm datas de início/fim, informações de contacto armazenadas

### Inventory Control
- **Functionality**: Gestão de produtos, stock, preços e alertas de stock mínimo
- **Purpose**: Controlar equipamentos e merchandising do clube
- **Trigger**: Utilizador autorizado acede ao inventário
- **Progression**: Inventário → Ver Produtos → Adicionar Produto → Definir Preço/Stock → Monitorizar Níveis
- **Success criteria**: Produtos cadastrados, stock atualizado, alertas de stock baixo funcionam

## Edge Case Handling
- **Orphaned Relationships** - When a guardian is deleted or status changes, system prompts reassignment of dependent athletes
- **Circular Dependencies** - Prevent users from being both guardian and athlete of each other
- **Missing Required Fields** - Form validation prevents saving incomplete critical data (name, birth date, member number, at least one member type)
- **File Upload Failures** - Graceful error handling with retry option for documents and images, maximum file size validation
- **Concurrent Edits** - Last-save-wins with timestamp indication if data was modified by another user
- **Invalid Data Types** - Input validation for NIF, CC, postal codes, email formats before submission
- **Multiple File Management** - Support for multiple files on medical certificates with individual removal capability

## Design Direction
The design should feel professional and trustworthy, like a corporate dashboard with clear information hierarchy. A data-rich interface is appropriate here since users need to see and process many fields efficiently - think organized and structured rather than minimalist.

## Color Selection
Triadic color scheme - Using three balanced colors to differentiate sections while maintaining professional cohesion: blue for primary actions (trust/reliability), green for success states (sports/health), orange for accents (energy/athletics).

- **Primary Color**: Deep Professional Blue (oklch(0.45 0.15 250)) - Communicates trust, stability, and professionalism appropriate for administrative systems
- **Secondary Colors**: Soft Neutral Gray (oklch(0.95 0.005 250)) for backgrounds and Charcoal (oklch(0.35 0.01 250)) for supporting elements
- **Accent Color**: Vibrant Sports Orange (oklch(0.68 0.18 45)) - Energetic highlight for CTAs and sports-related data
- **Foreground/Background Pairings**:
  - Background White (oklch(0.99 0 0)): Dark Charcoal text (oklch(0.25 0.01 250)) - Ratio 12.8:1 ✓
  - Card Light Gray (oklch(0.98 0.005 250)): Dark Charcoal text (oklch(0.25 0.01 250)) - Ratio 12.3:1 ✓
  - Primary Blue (oklch(0.45 0.15 250)): White text (oklch(0.99 0 0)) - Ratio 7.2:1 ✓
  - Secondary Gray (oklch(0.95 0.005 250)): Dark Charcoal text (oklch(0.25 0.01 250)) - Ratio 12.1:1 ✓
  - Accent Orange (oklch(0.68 0.18 45)): Dark Charcoal text (oklch(0.25 0.01 250)) - Ratio 5.8:1 ✓
  - Muted Gray (oklch(0.88 0.005 250)): Medium Charcoal text (oklch(0.45 0.01 250)) - Ratio 4.7:1 ✓

## Font Selection
The typeface should convey clarity and professionalism with excellent readability at small sizes for data-dense forms, using a modern sans-serif that works well for both interface elements and data display.

- **Typographic Hierarchy**:
  - H1 (Section Title): Inter SemiBold/32px/tight letter-spacing (-0.02em)
  - H2 (Tab Name): Inter SemiBold/24px/normal letter-spacing
  - H3 (Field Group): Inter Medium/18px/normal letter-spacing
  - Body (Labels): Inter Regular/14px/normal line-height (1.5)
  - Body (Input Values): Inter Regular/14px/normal line-height (1.5)
  - Small (Helper Text): Inter Regular/12px/relaxed line-height (1.6)
  - Badge/Tag: Inter Medium/12px/wide letter-spacing (0.02em)

## Animations
Animations should be subtle and functional, focused on communicating state changes and maintaining context during navigation - avoid distracting flourishes in this data-centric environment.

- **Purposeful Meaning**: Use motion to indicate when conditional fields appear/disappear, when tabs switch, and when data saves successfully
- **Hierarchy of Movement**: Priority on tab transitions (300ms), form field reveals (200ms), success confirmations (150ms), with minimal decorative animation

## Component Selection

- **Components**:
  - Tabs (Shadcn) for the 4-section profile interface with clear active states
  - Form, Input, Label, Textarea (Shadcn) for all data entry with consistent styling
  - Select, Checkbox, RadioGroup (Shadcn) for choice fields with proper accessibility
  - Card (Shadcn) for containing form sections with subtle elevation
  - Button (Shadcn) with primary (save) and secondary (cancel) variants
  - Avatar (Shadcn) for profile photos with fallback initials
  - Badge (Shadcn) for status indicators (Active/Inactive/Suspended) with color coding
  - Dialog (Shadcn) for confirmation modals when deleting or changing critical data
  - Calendar + Popover (Shadcn) for date selection fields
  - Toast (Sonner) for save confirmations and error notifications
  - Table (Shadcn) for user list with sortable columns
  - Switch (Shadcn) for boolean fields (minor, active, consent checkboxes)

- **Customizations**:
  - Custom file upload component with preview for documents and images, suporta múltiplos ficheiros
  - Federation card upload shows thumbnail preview with clickable print functionality
  - Custom user selector with search for guardian/athlete relationships
  - Custom field group component that handles conditional visibility logic
  - Status indicator badges with custom colors for member states
  - Multiple member type selection using checkboxes instead of dropdown

- **States**:
  - Inputs: default, focused (blue ring), filled, error (red border with message), disabled (gray with reduced opacity)
  - Buttons: default, hover (slight scale + brightness), active (pressed state), loading (spinner), disabled
  - Tabs: inactive (muted), hover (subtle highlight), active (bold with bottom border)
  - File uploads: empty state with upload icon, uploading progress, complete with preview, error state

- **Icon Selection**:
  - User, UserCircle for profile-related actions
  - Calendar for date pickers
  - Upload, File for document management
  - MagnifyingGlass for search functionality
  - Pencil for edit actions
  - Check, X for save/cancel
  - Warning for validation errors
  - Info for helper tooltips
  - Plus for adding new members

- **Spacing**:
  - Form fields: 6 (24px) between field groups, 4 (16px) between individual fields
  - Card padding: 6 (24px) on desktop, 4 (16px) on mobile
  - Tab content padding: 6 (24px)
  - Button padding: px-4 py-2 for default, px-6 py-3 for primary actions
  - Section margins: 8 (32px) between major sections

- **Mobile**:
  - Tabs convert to full-width stacked buttons with clear active state
  - Form switches from 2-column to single column layout below 768px
  - Avatar size reduces from 128px to 80px on mobile
  - File upload cards stack vertically
  - Fixed action bar at bottom for Save/Cancel buttons on mobile
  - User list table switches to card-based layout with key info visible
