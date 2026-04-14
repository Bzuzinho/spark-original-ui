<?php

namespace App\Support\Communication;

class TemplateVariableCatalog
{
    public static function definitions(): array
    {
        return [
            ['key' => 'nome', 'label' => 'Nome do utilizador', 'description' => 'Nome completo do destinatario.'],
            ['key' => 'nome_atleta', 'label' => 'Nome do atleta', 'description' => 'Nome completo do atleta/destinatario quando aplicavel.'],
            ['key' => 'nome_utilizador', 'label' => 'Nome curto', 'description' => 'Nome base do utilizador registado.'],
            ['key' => 'numero_socio', 'label' => 'Numero de socio', 'description' => 'Numero de socio da ficha do utilizador.'],
            ['key' => 'email', 'label' => 'Email', 'description' => 'Email principal do destinatario.'],
            ['key' => 'telemovel', 'label' => 'Telemovel', 'description' => 'Contacto movel do destinatario.'],
            ['key' => 'tipos_utilizador', 'label' => 'Tipos de utilizador', 'description' => 'Lista de tipos de utilizador associados a ficha do utilizador.'],
            ['key' => 'escalao', 'label' => 'Escalao', 'description' => 'Escalao principal do destinatario.'],
            ['key' => 'titulo_comunicacao', 'label' => 'Titulo da comunicacao', 'description' => 'Titulo/assunto da comunicacao ou envio.'],
            ['key' => 'titulo_alerta', 'label' => 'Titulo do alerta', 'description' => 'Titulo interno do alerta na aplicacao.'],
            ['key' => 'mensagem_alerta', 'label' => 'Mensagem do alerta', 'description' => 'Texto base do alerta/comunicacao.'],
            ['key' => 'mes', 'label' => 'Mes', 'description' => 'Mes da ultima fatura ou referencia financeira encontrada.'],
            ['key' => 'valor', 'label' => 'Valor', 'description' => 'Valor da ultima fatura ou movimento relacionado com o destinatario.'],
            ['key' => 'valor_em_divida', 'label' => 'Valor em divida', 'description' => 'Valor da ultima fatura por regularizar do destinatario.'],
            ['key' => 'data_vencimento', 'label' => 'Data de vencimento', 'description' => 'Data de vencimento da ultima fatura por regularizar.'],
            ['key' => 'evento_nome', 'label' => 'Nome do evento', 'description' => 'Nome do evento mais recente associado ao destinatario ou segmento.'],
            ['key' => 'evento_data', 'label' => 'Data do evento', 'description' => 'Data do evento mais recente associado ao destinatario ou segmento.'],
            ['key' => 'evento_local', 'label' => 'Local do evento', 'description' => 'Local do evento mais recente associado ao destinatario ou segmento.'],
        ];
    }

    public static function defaultMap(): array
    {
        $map = [];

        foreach (self::definitions() as $definition) {
            $map[$definition['key']] = $definition['description'];
        }

        return $map;
    }
}