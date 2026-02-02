<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        // 1. users table
        Schema::table('users', function (Blueprint $table) {
            // Core identity
            $table->renameColumn('numero_socio', 'member_number');
            $table->renameColumn('nome_completo', 'full_name');
            $table->renameColumn('perfil', 'profile');
            $table->renameColumn('tipo_membro', 'member_type');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('data_nascimento', 'birth_date');
            $table->renameColumn('menor', 'is_minor');
            $table->renameColumn('sexo', 'gender');
            $table->renameColumn('escalao', 'age_groups');
            
            // Documents/Consents
            $table->renameColumn('rgpd', 'gdpr_consent');
            $table->renameColumn('consentimento', 'consent');
            $table->renameColumn('afiliacao', 'affiliation');
            $table->renameColumn('declaracao_de_transporte', 'transport_declaration');
            
            // Sports
            $table->renameColumn('ativo_desportivo', 'sports_active');
            
            // Address
            $table->renameColumn('morada', 'address');
            $table->renameColumn('codigo_postal', 'postal_code');
            $table->renameColumn('localidade', 'city');
            $table->renameColumn('telefone', 'phone');
            $table->renameColumn('telemovel', 'mobile');
            
            // ID/Documents
            $table->renameColumn('numero_cartao_cidadao', 'id_card_number');
            $table->renameColumn('validade_cartao_cidadao', 'id_card_expiry');
            $table->renameColumn('numero_utente', 'health_number');
            
            // Emergency
            $table->renameColumn('contacto_emergencia_nome', 'emergency_contact_name');
            $table->renameColumn('contacto_emergencia_telefone', 'emergency_contact_phone');
            $table->renameColumn('contacto_emergencia_relacao', 'emergency_contact_relationship');
            
            // Financial
            $table->renameColumn('tipo_mensalidade', 'membership_fee_type');
            $table->renameColumn('conta_corrente', 'current_account');
            $table->renameColumn('centro_custo', 'cost_centers');
            
            // Sports specific
            $table->renameColumn('num_federacao', 'federation_number');
            $table->renameColumn('cartao_federacao', 'federation_card');
            $table->renameColumn('numero_pmb', 'pmb_number');
            $table->renameColumn('data_inscricao', 'registration_date');
            $table->renameColumn('inscricao', 'registration_file');
            $table->renameColumn('data_atestado_medico', 'medical_certificate_date');
            $table->renameColumn('arquivo_atestado_medico', 'medical_certificate_files');
            $table->renameColumn('informacoes_medicas', 'medical_information');
            
            // Guardian relationships
            $table->renameColumn('encarregado_educacao', 'guardians');
            $table->renameColumn('educandos', 'dependents');
            
            // Additional fields
            $table->renameColumn('data_rgpd', 'gdpr_date');
            $table->renameColumn('arquivo_rgpd', 'gdpr_file');
            $table->renameColumn('data_consentimento', 'consent_date');
            $table->renameColumn('arquivo_consentimento', 'consent_file');
            $table->renameColumn('data_afiliacao', 'affiliation_date');
            $table->renameColumn('arquivo_afiliacao', 'affiliation_file');
            $table->renameColumn('email_utilizador', 'user_email');
            $table->renameColumn('senha', 'user_password');
            $table->renameColumn('numero_irmaos', 'siblings_count');
            
            // Other fields
            $table->renameColumn('foto_perfil', 'profile_photo');
            $table->renameColumn('nacionalidade', 'nationality');
            $table->renameColumn('estado_civil', 'marital_status');
            $table->renameColumn('ocupacao', 'occupation');
            $table->renameColumn('empresa', 'company');
            $table->renameColumn('escola', 'school');
            $table->renameColumn('contacto', 'contact');
            $table->renameColumn('email_secundario', 'secondary_email');
            $table->renameColumn('contacto_telefonico', 'phone_contact');
            $table->renameColumn('declaracao_transporte', 'transport_declaration_file');
        });
        
        // 2. trainings table
        Schema::table('trainings', function (Blueprint $table) {
            $table->renameColumn('numero_treino', 'training_number');
            $table->renameColumn('data', 'date');
            $table->renameColumn('hora_inicio', 'start_time');
            $table->renameColumn('hora_fim', 'end_time');
            $table->renameColumn('local', 'location');
            $table->renameColumn('epoca_id', 'season_id');
            $table->renameColumn('microciclo_id', 'microcycle_id');
            $table->renameColumn('grupo_escalao_id', 'age_group_id');
            $table->renameColumn('escaloes', 'age_groups');
            $table->renameColumn('tipo_treino', 'training_type');
            $table->renameColumn('volume_planeado_m', 'planned_volume_m');
            $table->renameColumn('notas_gerais', 'general_notes');
            $table->renameColumn('descricao_treino', 'description');
            $table->renameColumn('criado_por', 'created_by');
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('atualizado_em', 'updated_at_custom');
        });
        
        // 3. training_series table
        Schema::table('training_series', function (Blueprint $table) {
            $table->renameColumn('treino_id', 'training_id');
            $table->renameColumn('ordem', 'order');
            $table->renameColumn('descricao_texto', 'description');
            $table->renameColumn('distancia_total_m', 'total_distance_m');
            $table->renameColumn('zona_intensidade', 'intensity_zone');
            $table->renameColumn('estilo', 'stroke');
            $table->renameColumn('repeticoes', 'repetitions');
            $table->renameColumn('intervalo', 'interval');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 4. athlete_sports_data table
        Schema::table('athlete_sports_data', function (Blueprint $table) {
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('num_federacao', 'federation_number');
            $table->renameColumn('cartao_federacao', 'federation_card');
            $table->renameColumn('numero_pmb', 'pmb_number');
            $table->renameColumn('escalao_id', 'age_group_id');
            $table->renameColumn('data_inscricao', 'registration_date');
            $table->renameColumn('inscricao_path', 'registration_file');
            $table->renameColumn('data_atestado_medico', 'medical_certificate_date');
            $table->renameColumn('arquivo_atestado_medico', 'medical_certificate_files');
            $table->renameColumn('informacoes_medicas', 'medical_information');
            $table->renameColumn('ativo', 'active');
        });
        
        // 5. presences table
        Schema::table('presences', function (Blueprint $table) {
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('data', 'date');
            $table->renameColumn('treino_id', 'training_id');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('justificacao', 'justification');
            $table->renameColumn('presente', 'present');
        });
        
        // 6. competitions table
        Schema::table('competitions', function (Blueprint $table) {
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('local', 'location');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('nivel', 'level');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 7. provas table
        Schema::table('provas', function (Blueprint $table) {
            $table->renameColumn('competicao_id', 'competition_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('distancia', 'distance');
            $table->renameColumn('estilo', 'stroke');
            $table->renameColumn('genero', 'gender');
            $table->renameColumn('escalao', 'age_group');
            $table->renameColumn('data_hora', 'datetime');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 8. competition_registrations table
        Schema::table('competition_registrations', function (Blueprint $table) {
            $table->renameColumn('competicao_id', 'competition_id');
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('provas', 'races');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 9. results table
        Schema::table('results', function (Blueprint $table) {
            $table->renameColumn('prova_id', 'race_id');
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('tempo_oficial', 'official_time');
            $table->renameColumn('tempo_reacao', 'reaction_time');
            $table->renameColumn('posicao', 'position');
            $table->renameColumn('pontos_fina', 'fina_points');
            $table->renameColumn('desclassificado', 'disqualified');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 10. result_provas table
        Schema::table('result_provas', function (Blueprint $table) {
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('evento_nome', 'event_name');
            $table->renameColumn('prova', 'race');
            $table->renameColumn('local', 'location');
            $table->renameColumn('data', 'date');
            $table->renameColumn('piscina', 'pool');
            $table->renameColumn('tempo_final', 'final_time');
        });
        
        // 11. result_splits table
        Schema::table('result_splits', function (Blueprint $table) {
            $table->renameColumn('resultado_id', 'result_id');
            $table->renameColumn('distancia_parcial_m', 'partial_distance_m');
            $table->renameColumn('tempo_parcial', 'partial_time');
        });
        
        // 12. invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('data_fatura', 'invoice_date');
            $table->renameColumn('mes', 'month');
            $table->renameColumn('data_emissao', 'issue_date');
            $table->renameColumn('data_vencimento', 'due_date');
            $table->renameColumn('valor_total', 'total_amount');
            $table->renameColumn('estado_pagamento', 'payment_status');
            $table->renameColumn('numero_recibo', 'receipt_number');
            $table->renameColumn('referencia_pagamento', 'payment_reference');
            $table->renameColumn('centro_custo_id', 'cost_center_id');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 13. invoice_items table
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->renameColumn('fatura_id', 'invoice_id');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('quantidade', 'quantity');
            $table->renameColumn('preco_unitario', 'unit_price');
            $table->renameColumn('valor_total', 'total_amount');
        });
        
        // 14. movements table
        Schema::table('movements', function (Blueprint $table) {
            $table->renameColumn('nome_manual', 'manual_name');
            $table->renameColumn('nif_manual', 'manual_tax_id');
            $table->renameColumn('morada_manual', 'manual_address');
            $table->renameColumn('classificacao', 'classification');
            $table->renameColumn('data_emissao', 'issue_date');
            $table->renameColumn('data_vencimento', 'due_date');
            $table->renameColumn('valor_total', 'total_amount');
            $table->renameColumn('estado_pagamento', 'payment_status');
            $table->renameColumn('numero_recibo', 'receipt_number');
            $table->renameColumn('referencia_pagamento', 'payment_reference');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 15. movement_items table
        Schema::table('movement_items', function (Blueprint $table) {
            $table->renameColumn('movimento_id', 'movement_id');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('quantidade', 'quantity');
            $table->renameColumn('preco_unitario', 'unit_price');
            $table->renameColumn('valor_total', 'total_amount');
        });
        
        // 16. transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor', 'amount');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('data', 'date');
            $table->renameColumn('metodo_pagamento', 'payment_method');
            $table->renameColumn('comprovativo', 'receipt');
            $table->renameColumn('estado', 'status');
        });
        
        // 17. membership_fees table
        Schema::table('membership_fees', function (Blueprint $table) {
            $table->renameColumn('mes', 'month');
            $table->renameColumn('ano', 'year');
            $table->renameColumn('valor', 'amount');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('data_pagamento', 'payment_date');
        });
        
        // 18. financial_categories table
        Schema::table('financial_categories', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('cor', 'color');
            $table->renameColumn('ativa', 'active');
        });
        
        // 19. financial_entries table
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->renameColumn('data', 'date');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('categoria', 'category');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor', 'amount');
            $table->renameColumn('fatura_id', 'invoice_id');
            $table->renameColumn('metodo_pagamento', 'payment_method');
            $table->renameColumn('comprovativo', 'receipt');
        });
        
        // 20. bank_statements table
        Schema::table('bank_statements', function (Blueprint $table) {
            $table->renameColumn('data', 'date');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor', 'amount');
            $table->renameColumn('saldo', 'balance');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('categoria', 'category');
            $table->renameColumn('reconciliado', 'reconciled');
        });
        
        // 21. products table
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('codigo', 'code');
            $table->renameColumn('categoria', 'category');
            $table->renameColumn('preco', 'price');
            $table->renameColumn('stock_minimo', 'minimum_stock');
            $table->renameColumn('imagem', 'image');
            $table->renameColumn('ativo', 'active');
        });
        
        // 22. sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->renameColumn('produto_id', 'product_id');
            $table->renameColumn('socio_id', 'user_id');
            $table->renameColumn('quantidade', 'quantity');
            $table->renameColumn('preco_unitario', 'unit_price');
            $table->renameColumn('valor_total', 'total_amount');
            $table->renameColumn('data_venda', 'sale_date');
            $table->renameColumn('metodo_pagamento', 'payment_method');
        });
        
        // 23. sponsors table
        Schema::table('sponsors', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('contacto', 'contact');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('valor_anual', 'annual_value');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('estado', 'status');
        });
        
        // 24. news_items table
        Schema::table('news_items', function (Blueprint $table) {
            $table->renameColumn('titulo', 'title');
            $table->renameColumn('conteudo', 'content');
            $table->renameColumn('imagem', 'image');
            $table->renameColumn('data_publicacao', 'publish_date');
            $table->renameColumn('autor_id', 'author_id');
            $table->renameColumn('visibilidade', 'visibility');
            $table->renameColumn('estado', 'status');
        });
        
        // 25. communications table
        Schema::table('communications', function (Blueprint $table) {
            $table->renameColumn('assunto', 'subject');
            $table->renameColumn('mensagem', 'message');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('destinatarios', 'recipients');
            $table->renameColumn('estado', 'status');
            $table->renameColumn('agendado_para', 'scheduled_for');
            $table->renameColumn('enviado_em', 'sent_at');
            $table->renameColumn('total_enviados', 'total_sent');
            $table->renameColumn('total_falhados', 'total_failed');
        });
        
        // 26. automated_communications table
        Schema::table('automated_communications', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('gatilho', 'trigger');
            $table->renameColumn('assunto', 'subject');
            $table->renameColumn('mensagem', 'message');
            $table->renameColumn('ativo', 'active');
        });
        
        // 27. convocation_groups table
        Schema::table('convocation_groups', function (Blueprint $table) {
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('escalao', 'age_group');
            $table->renameColumn('atletas', 'athletes');
        });
        
        // 28. convocation_athletes table
        Schema::table('convocation_athletes', function (Blueprint $table) {
            $table->renameColumn('convocatoria_grupo_id', 'convocation_group_id');
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('provas', 'races');
            $table->renameColumn('presente', 'present');
            $table->renameColumn('confirmado', 'confirmed');
        });
        
        // 29. convocation_movements table
        Schema::table('convocation_movements', function (Blueprint $table) {
            $table->renameColumn('evento_id', 'event_id');
            $table->renameColumn('convocatoria_grupo_id', 'convocation_group_id');
            $table->renameColumn('tipo', 'type');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor_total', 'total_amount');
            $table->renameColumn('estado', 'status');
        });
        
        // 30. convocation_movement_items table
        Schema::table('convocation_movement_items', function (Blueprint $table) {
            $table->renameColumn('convocatoria_movimento_id', 'convocation_movement_id');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('valor', 'amount');
        });
        
        // 31. event_type_configs table
        Schema::table('event_type_configs', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('cor', 'color');
            $table->renameColumn('descricao', 'description');
            $table->renameColumn('gera_taxa', 'generates_fee');
            $table->renameColumn('valor_taxa_padrao', 'default_fee_value');
            $table->renameColumn('requer_convocatoria', 'requires_call_up');
            $table->renameColumn('exige_confirmacao', 'requires_confirmation');
            $table->renameColumn('permite_transporte', 'allows_transport');
            $table->renameColumn('ativo', 'active');
        });
        
        // 32. training_athletes table
        Schema::table('training_athletes', function (Blueprint $table) {
            $table->renameColumn('treino_id', 'training_id');
            $table->renameColumn('atleta_id', 'athlete_id');
            $table->renameColumn('presente', 'present');
            $table->renameColumn('observacoes', 'notes');
        });
        
        // 33. seasons table
        Schema::table('seasons', function (Blueprint $table) {
            $table->renameColumn('nome', 'name');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('ativo', 'active');
        });
        
        // 34. macrocycles table
        Schema::table('macrocycles', function (Blueprint $table) {
            $table->renameColumn('temporada_id', 'season_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('objetivo', 'objective');
        });
        
        // 35. mesocycles table
        Schema::table('mesocycles', function (Blueprint $table) {
            $table->renameColumn('macrociclo_id', 'macrocycle_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('tipo', 'type');
        });
        
        // 36. microcycles table
        Schema::table('microcycles', function (Blueprint $table) {
            $table->renameColumn('mesociclo_id', 'mesocycle_id');
            $table->renameColumn('nome', 'name');
            $table->renameColumn('data_inicio', 'start_date');
            $table->renameColumn('data_fim', 'end_date');
            $table->renameColumn('tipo', 'type');
        });
        
        // 37. monthly_fees table
        Schema::table('monthly_fees', function (Blueprint $table) {
            $table->renameColumn('mes', 'month');
            $table->renameColumn('ano', 'year');
            $table->renameColumn('valor_base', 'base_amount');
            $table->renameColumn('descontos', 'discounts');
            $table->renameColumn('valor_final', 'final_amount');
            $table->renameColumn('ativo', 'active');
        });
    }

    public function down(): void
    {
        // 37. monthly_fees table
        Schema::table('monthly_fees', function (Blueprint $table) {
            $table->renameColumn('month', 'mes');
            $table->renameColumn('year', 'ano');
            $table->renameColumn('base_amount', 'valor_base');
            $table->renameColumn('discounts', 'descontos');
            $table->renameColumn('final_amount', 'valor_final');
            $table->renameColumn('active', 'ativo');
        });
        
        // 36. microcycles table
        Schema::table('microcycles', function (Blueprint $table) {
            $table->renameColumn('mesocycle_id', 'mesociclo_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('type', 'tipo');
        });
        
        // 35. mesocycles table
        Schema::table('mesocycles', function (Blueprint $table) {
            $table->renameColumn('macrocycle_id', 'macrociclo_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('type', 'tipo');
        });
        
        // 34. macrocycles table
        Schema::table('macrocycles', function (Blueprint $table) {
            $table->renameColumn('season_id', 'temporada_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('objective', 'objetivo');
        });
        
        // 33. seasons table
        Schema::table('seasons', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('active', 'ativo');
        });
        
        // 32. training_athletes table
        Schema::table('training_athletes', function (Blueprint $table) {
            $table->renameColumn('training_id', 'treino_id');
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('present', 'presente');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 31. event_type_configs table
        Schema::table('event_type_configs', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('color', 'cor');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('generates_fee', 'gera_taxa');
            $table->renameColumn('default_fee_value', 'valor_taxa_padrao');
            $table->renameColumn('requires_call_up', 'requer_convocatoria');
            $table->renameColumn('requires_confirmation', 'exige_confirmacao');
            $table->renameColumn('allows_transport', 'permite_transporte');
            $table->renameColumn('active', 'ativo');
        });
        
        // 30. convocation_movement_items table
        Schema::table('convocation_movement_items', function (Blueprint $table) {
            $table->renameColumn('convocation_movement_id', 'convocatoria_movimento_id');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('amount', 'valor');
        });
        
        // 29. convocation_movements table
        Schema::table('convocation_movements', function (Blueprint $table) {
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('convocation_group_id', 'convocatoria_grupo_id');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('total_amount', 'valor_total');
            $table->renameColumn('status', 'estado');
        });
        
        // 28. convocation_athletes table
        Schema::table('convocation_athletes', function (Blueprint $table) {
            $table->renameColumn('convocation_group_id', 'convocatoria_grupo_id');
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('races', 'provas');
            $table->renameColumn('present', 'presente');
            $table->renameColumn('confirmed', 'confirmado');
        });
        
        // 27. convocation_groups table
        Schema::table('convocation_groups', function (Blueprint $table) {
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('age_group', 'escalao');
            $table->renameColumn('athletes', 'atletas');
        });
        
        // 26. automated_communications table
        Schema::table('automated_communications', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('trigger', 'gatilho');
            $table->renameColumn('subject', 'assunto');
            $table->renameColumn('message', 'mensagem');
            $table->renameColumn('active', 'ativo');
        });
        
        // 25. communications table
        Schema::table('communications', function (Blueprint $table) {
            $table->renameColumn('subject', 'assunto');
            $table->renameColumn('message', 'mensagem');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('recipients', 'destinatarios');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('scheduled_for', 'agendado_para');
            $table->renameColumn('sent_at', 'enviado_em');
            $table->renameColumn('total_sent', 'total_enviados');
            $table->renameColumn('total_failed', 'total_falhados');
        });
        
        // 24. news_items table
        Schema::table('news_items', function (Blueprint $table) {
            $table->renameColumn('title', 'titulo');
            $table->renameColumn('content', 'conteudo');
            $table->renameColumn('image', 'imagem');
            $table->renameColumn('publish_date', 'data_publicacao');
            $table->renameColumn('author_id', 'autor_id');
            $table->renameColumn('visibility', 'visibilidade');
            $table->renameColumn('status', 'estado');
        });
        
        // 23. sponsors table
        Schema::table('sponsors', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('contact', 'contacto');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('annual_value', 'valor_anual');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('status', 'estado');
        });
        
        // 22. sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->renameColumn('product_id', 'produto_id');
            $table->renameColumn('user_id', 'socio_id');
            $table->renameColumn('quantity', 'quantidade');
            $table->renameColumn('unit_price', 'preco_unitario');
            $table->renameColumn('total_amount', 'valor_total');
            $table->renameColumn('sale_date', 'data_venda');
            $table->renameColumn('payment_method', 'metodo_pagamento');
        });
        
        // 21. products table
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('code', 'codigo');
            $table->renameColumn('category', 'categoria');
            $table->renameColumn('price', 'preco');
            $table->renameColumn('minimum_stock', 'stock_minimo');
            $table->renameColumn('image', 'imagem');
            $table->renameColumn('active', 'ativo');
        });
        
        // 20. bank_statements table
        Schema::table('bank_statements', function (Blueprint $table) {
            $table->renameColumn('date', 'data');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('amount', 'valor');
            $table->renameColumn('balance', 'saldo');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('category', 'categoria');
            $table->renameColumn('reconciled', 'reconciliado');
        });
        
        // 19. financial_entries table
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->renameColumn('date', 'data');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('category', 'categoria');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('amount', 'valor');
            $table->renameColumn('invoice_id', 'fatura_id');
            $table->renameColumn('payment_method', 'metodo_pagamento');
            $table->renameColumn('receipt', 'comprovativo');
        });
        
        // 18. financial_categories table
        Schema::table('financial_categories', function (Blueprint $table) {
            $table->renameColumn('name', 'nome');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('color', 'cor');
            $table->renameColumn('active', 'ativa');
        });
        
        // 17. membership_fees table
        Schema::table('membership_fees', function (Blueprint $table) {
            $table->renameColumn('month', 'mes');
            $table->renameColumn('year', 'ano');
            $table->renameColumn('amount', 'valor');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('payment_date', 'data_pagamento');
        });
        
        // 16. transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('amount', 'valor');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('date', 'data');
            $table->renameColumn('payment_method', 'metodo_pagamento');
            $table->renameColumn('receipt', 'comprovativo');
            $table->renameColumn('status', 'estado');
        });
        
        // 15. movement_items table
        Schema::table('movement_items', function (Blueprint $table) {
            $table->renameColumn('movement_id', 'movimento_id');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('quantity', 'quantidade');
            $table->renameColumn('unit_price', 'preco_unitario');
            $table->renameColumn('total_amount', 'valor_total');
        });
        
        // 14. movements table
        Schema::table('movements', function (Blueprint $table) {
            $table->renameColumn('manual_name', 'nome_manual');
            $table->renameColumn('manual_tax_id', 'nif_manual');
            $table->renameColumn('manual_address', 'morada_manual');
            $table->renameColumn('classification', 'classificacao');
            $table->renameColumn('issue_date', 'data_emissao');
            $table->renameColumn('due_date', 'data_vencimento');
            $table->renameColumn('total_amount', 'valor_total');
            $table->renameColumn('payment_status', 'estado_pagamento');
            $table->renameColumn('receipt_number', 'numero_recibo');
            $table->renameColumn('payment_reference', 'referencia_pagamento');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 13. invoice_items table
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->renameColumn('invoice_id', 'fatura_id');
            $table->renameColumn('description', 'descricao');
            $table->renameColumn('quantity', 'quantidade');
            $table->renameColumn('unit_price', 'preco_unitario');
            $table->renameColumn('total_amount', 'valor_total');
        });
        
        // 12. invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('invoice_date', 'data_fatura');
            $table->renameColumn('month', 'mes');
            $table->renameColumn('issue_date', 'data_emissao');
            $table->renameColumn('due_date', 'data_vencimento');
            $table->renameColumn('total_amount', 'valor_total');
            $table->renameColumn('payment_status', 'estado_pagamento');
            $table->renameColumn('receipt_number', 'numero_recibo');
            $table->renameColumn('payment_reference', 'referencia_pagamento');
            $table->renameColumn('cost_center_id', 'centro_custo_id');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 11. result_splits table
        Schema::table('result_splits', function (Blueprint $table) {
            $table->renameColumn('result_id', 'resultado_id');
            $table->renameColumn('partial_distance_m', 'distancia_parcial_m');
            $table->renameColumn('partial_time', 'tempo_parcial');
        });
        
        // 10. result_provas table
        Schema::table('result_provas', function (Blueprint $table) {
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('event_name', 'evento_nome');
            $table->renameColumn('race', 'prova');
            $table->renameColumn('location', 'local');
            $table->renameColumn('date', 'data');
            $table->renameColumn('pool', 'piscina');
            $table->renameColumn('final_time', 'tempo_final');
        });
        
        // 9. results table
        Schema::table('results', function (Blueprint $table) {
            $table->renameColumn('race_id', 'prova_id');
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('official_time', 'tempo_oficial');
            $table->renameColumn('reaction_time', 'tempo_reacao');
            $table->renameColumn('position', 'posicao');
            $table->renameColumn('fina_points', 'pontos_fina');
            $table->renameColumn('disqualified', 'desclassificado');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 8. competition_registrations table
        Schema::table('competition_registrations', function (Blueprint $table) {
            $table->renameColumn('competition_id', 'competicao_id');
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('races', 'provas');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 7. provas table
        Schema::table('provas', function (Blueprint $table) {
            $table->renameColumn('competition_id', 'competicao_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('distance', 'distancia');
            $table->renameColumn('stroke', 'estilo');
            $table->renameColumn('gender', 'genero');
            $table->renameColumn('age_group', 'escalao');
            $table->renameColumn('datetime', 'data_hora');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 6. competitions table
        Schema::table('competitions', function (Blueprint $table) {
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('name', 'nome');
            $table->renameColumn('location', 'local');
            $table->renameColumn('start_date', 'data_inicio');
            $table->renameColumn('end_date', 'data_fim');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('level', 'nivel');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 5. presences table
        Schema::table('presences', function (Blueprint $table) {
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('date', 'data');
            $table->renameColumn('training_id', 'treino_id');
            $table->renameColumn('type', 'tipo');
            $table->renameColumn('justification', 'justificacao');
            $table->renameColumn('present', 'presente');
        });
        
        // 4. athlete_sports_data table
        Schema::table('athlete_sports_data', function (Blueprint $table) {
            $table->renameColumn('athlete_id', 'atleta_id');
            $table->renameColumn('federation_number', 'num_federacao');
            $table->renameColumn('federation_card', 'cartao_federacao');
            $table->renameColumn('pmb_number', 'numero_pmb');
            $table->renameColumn('age_group_id', 'escalao_id');
            $table->renameColumn('registration_date', 'data_inscricao');
            $table->renameColumn('registration_file', 'inscricao_path');
            $table->renameColumn('medical_certificate_date', 'data_atestado_medico');
            $table->renameColumn('medical_certificate_files', 'arquivo_atestado_medico');
            $table->renameColumn('medical_information', 'informacoes_medicas');
            $table->renameColumn('active', 'ativo');
        });
        
        // 3. training_series table
        Schema::table('training_series', function (Blueprint $table) {
            $table->renameColumn('training_id', 'treino_id');
            $table->renameColumn('order', 'ordem');
            $table->renameColumn('description', 'descricao_texto');
            $table->renameColumn('total_distance_m', 'distancia_total_m');
            $table->renameColumn('intensity_zone', 'zona_intensidade');
            $table->renameColumn('stroke', 'estilo');
            $table->renameColumn('repetitions', 'repeticoes');
            $table->renameColumn('interval', 'intervalo');
            $table->renameColumn('notes', 'observacoes');
        });
        
        // 2. trainings table
        Schema::table('trainings', function (Blueprint $table) {
            $table->renameColumn('training_number', 'numero_treino');
            $table->renameColumn('date', 'data');
            $table->renameColumn('start_time', 'hora_inicio');
            $table->renameColumn('end_time', 'hora_fim');
            $table->renameColumn('location', 'local');
            $table->renameColumn('season_id', 'epoca_id');
            $table->renameColumn('microcycle_id', 'microciclo_id');
            $table->renameColumn('age_group_id', 'grupo_escalao_id');
            $table->renameColumn('age_groups', 'escaloes');
            $table->renameColumn('training_type', 'tipo_treino');
            $table->renameColumn('planned_volume_m', 'volume_planeado_m');
            $table->renameColumn('general_notes', 'notas_gerais');
            $table->renameColumn('description', 'descricao_treino');
            $table->renameColumn('created_by', 'criado_por');
            $table->renameColumn('event_id', 'evento_id');
            $table->renameColumn('updated_at_custom', 'atualizado_em');
        });
        
        // 1. users table
        Schema::table('users', function (Blueprint $table) {
            // Other fields
            $table->renameColumn('profile_photo', 'foto_perfil');
            $table->renameColumn('nationality', 'nacionalidade');
            $table->renameColumn('marital_status', 'estado_civil');
            $table->renameColumn('occupation', 'ocupacao');
            $table->renameColumn('company', 'empresa');
            $table->renameColumn('school', 'escola');
            $table->renameColumn('contact', 'contacto');
            $table->renameColumn('secondary_email', 'email_secundario');
            $table->renameColumn('phone_contact', 'contacto_telefonico');
            $table->renameColumn('transport_declaration_file', 'declaracao_transporte');
            
            // Additional fields
            $table->renameColumn('gdpr_date', 'data_rgpd');
            $table->renameColumn('gdpr_file', 'arquivo_rgpd');
            $table->renameColumn('consent_date', 'data_consentimento');
            $table->renameColumn('consent_file', 'arquivo_consentimento');
            $table->renameColumn('affiliation_date', 'data_afiliacao');
            $table->renameColumn('affiliation_file', 'arquivo_afiliacao');
            $table->renameColumn('user_email', 'email_utilizador');
            $table->renameColumn('user_password', 'senha');
            $table->renameColumn('siblings_count', 'numero_irmaos');
            
            // Guardian relationships
            $table->renameColumn('guardians', 'encarregado_educacao');
            $table->renameColumn('dependents', 'educandos');
            
            // Sports specific
            $table->renameColumn('federation_number', 'num_federacao');
            $table->renameColumn('federation_card', 'cartao_federacao');
            $table->renameColumn('pmb_number', 'numero_pmb');
            $table->renameColumn('registration_date', 'data_inscricao');
            $table->renameColumn('registration_file', 'inscricao');
            $table->renameColumn('medical_certificate_date', 'data_atestado_medico');
            $table->renameColumn('medical_certificate_files', 'arquivo_atestado_medico');
            $table->renameColumn('medical_information', 'informacoes_medicas');
            
            // Financial
            $table->renameColumn('membership_fee_type', 'tipo_mensalidade');
            $table->renameColumn('current_account', 'conta_corrente');
            $table->renameColumn('cost_centers', 'centro_custo');
            
            // Emergency
            $table->renameColumn('emergency_contact_name', 'contacto_emergencia_nome');
            $table->renameColumn('emergency_contact_phone', 'contacto_emergencia_telefone');
            $table->renameColumn('emergency_contact_relationship', 'contacto_emergencia_relacao');
            
            // ID/Documents
            $table->renameColumn('id_card_number', 'numero_cartao_cidadao');
            $table->renameColumn('id_card_expiry', 'validade_cartao_cidadao');
            $table->renameColumn('health_number', 'numero_utente');
            
            // Address
            $table->renameColumn('address', 'morada');
            $table->renameColumn('postal_code', 'codigo_postal');
            $table->renameColumn('city', 'localidade');
            $table->renameColumn('phone', 'telefone');
            $table->renameColumn('mobile', 'telemovel');
            
            // Sports
            $table->renameColumn('sports_active', 'ativo_desportivo');
            
            // Documents/Consents
            $table->renameColumn('gdpr_consent', 'rgpd');
            $table->renameColumn('consent', 'consentimento');
            $table->renameColumn('affiliation', 'afiliacao');
            $table->renameColumn('transport_declaration', 'declaracao_de_transporte');
            
            // Core identity
            $table->renameColumn('member_number', 'numero_socio');
            $table->renameColumn('full_name', 'nome_completo');
            $table->renameColumn('profile', 'perfil');
            $table->renameColumn('member_type', 'tipo_membro');
            $table->renameColumn('status', 'estado');
            $table->renameColumn('birth_date', 'data_nascimento');
            $table->renameColumn('is_minor', 'menor');
            $table->renameColumn('gender', 'sexo');
            $table->renameColumn('age_groups', 'escalao');
        });
    }
};
