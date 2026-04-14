<?php

namespace Database\Seeders;

use App\Models\CommunicationTemplate;
use Illuminate\Database\Seeder;

class CommunicationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Mensalidade - Email',
                'channel' => 'email',
                'category' => 'mensalidade',
                'subject' => 'Lembrete de mensalidade - {{nome}}',
                'body' => "Ola {{nome}},\n\nTem uma mensalidade pendente.\nPor favor regularize o pagamento para evitar constrangimentos.\n\nObrigado,\nClubOS",
            ],
            [
                'name' => 'Mensalidade - SMS',
                'channel' => 'sms',
                'category' => 'mensalidade',
                'subject' => null,
                'body' => 'Ola {{nome}}, tem uma mensalidade pendente. Regularize o pagamento. ClubOS',
            ],
            [
                'name' => 'Presencas - Email',
                'channel' => 'email',
                'category' => 'presencas',
                'subject' => 'Alerta de presencas - {{nome}}',
                'body' => "Ola {{nome}},\n\nDetetamos um padrao de faltas recentes.\nPedimos contacto para acompanhamento.\n\nObrigado,\nClubOS",
            ],
            [
                'name' => 'Presencas - SMS',
                'channel' => 'sms',
                'category' => 'presencas',
                'subject' => null,
                'body' => 'Ola {{nome}}, verificamos faltas recentes. Contacte a equipa tecnica. ClubOS',
            ],
            [
                'name' => 'Comportamento - Email',
                'channel' => 'email',
                'category' => 'comportamento',
                'subject' => 'Acompanhamento de comportamento - {{nome}}',
                'body' => "Ola {{nome}},\n\nPrecisamos alinhar alguns aspetos comportamentais observados recentemente.\nPor favor contacte a equipa tecnica.\n\nObrigado,\nClubOS",
            ],
            [
                'name' => 'Comportamento - SMS',
                'channel' => 'sms',
                'category' => 'comportamento',
                'subject' => null,
                'body' => 'Ola {{nome}}, precisamos de alinhar comportamento recente. Contacte a equipa tecnica. ClubOS',
            ],
            [
                'name' => 'Geral - Alerta App',
                'channel' => 'alert_app',
                'category' => 'geral',
                'subject' => null,
                'body' => 'Nova comunicacao disponivel para {{nome}}.',
            ],
            [
                'name' => 'Geral - Interno',
                'channel' => 'interno',
                'category' => 'geral',
                'subject' => 'Comunicacao interna - {{nome}}',
                'body' => 'Existe uma nova comunicacao interna para consulta.',
            ],
            [
                'name' => 'Automação Financeiro - Fatura Email',
                'channel' => 'email',
                'category' => 'mensalidade',
                'subject' => '{{titulo_comunicacao}}',
                'body' => "Ola {{nome}},\n\n{{mensagem_alerta}}\n\nMes: {{mes}}\nValor: {{valor}}\nVencimento: {{data_vencimento}}\n\nClubOS",
            ],
            [
                'name' => 'Automação Financeiro - Fatura App',
                'channel' => 'alert_app',
                'category' => 'mensalidade',
                'subject' => null,
                'body' => '{{mensagem_alerta}}',
            ],
            [
                'name' => 'Automação Financeiro - Movimento Email',
                'channel' => 'email',
                'category' => 'geral',
                'subject' => '{{titulo_comunicacao}}',
                'body' => "Ola {{nome}},\n\n{{mensagem_alerta}}\n\nValor: {{valor}}\nClubOS",
            ],
            [
                'name' => 'Automação Financeiro - Movimento App',
                'channel' => 'alert_app',
                'category' => 'geral',
                'subject' => null,
                'body' => '{{mensagem_alerta}}',
            ],
            [
                'name' => 'Automação Eventos - Convocatória Email',
                'channel' => 'email',
                'category' => 'geral',
                'subject' => '{{titulo_comunicacao}}',
                'body' => "Ola {{nome}},\n\n{{mensagem_alerta}}\n\nEvento: {{evento_nome}}\nData: {{evento_data}}\nLocal: {{evento_local}}\n\nClubOS",
            ],
            [
                'name' => 'Automação Eventos - Convocatória App',
                'channel' => 'alert_app',
                'category' => 'geral',
                'subject' => null,
                'body' => '{{mensagem_alerta}}',
            ],
            [
                'name' => 'Automação Logística - Requisição Email',
                'channel' => 'email',
                'category' => 'geral',
                'subject' => '{{titulo_comunicacao}}',
                'body' => "Ola {{nome}},\n\n{{mensagem_alerta}}\n\nClubOS",
            ],
            [
                'name' => 'Automação Logística - Requisição App',
                'channel' => 'alert_app',
                'category' => 'geral',
                'subject' => null,
                'body' => '{{mensagem_alerta}}',
            ],
            [
                'name' => 'Automação Logística - Compra Fornecedor App',
                'channel' => 'alert_app',
                'category' => 'geral',
                'subject' => null,
                'body' => '{{mensagem_alerta}}',
            ],
        ];

        foreach ($templates as $template) {
            CommunicationTemplate::updateOrCreate(
                [
                    'name' => $template['name'],
                    'channel' => $template['channel'],
                ],
                [
                    'category' => $template['category'],
                    'subject' => $template['subject'],
                    'body' => $template['body'],
                    'status' => 'ativo',
                ]
            );
        }
    }
}
