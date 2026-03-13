<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // 1) Backfill athlete_sports_data from users sports fields
        if (Schema::hasTable('users') && Schema::hasTable('athlete_sports_data')) {
            $athletes = DB::table('users')
                ->whereJsonContains('tipo_membro', 'atleta')
                ->get([
                    'id',
                    'num_federacao',
                    'cartao_federacao',
                    'numero_pmb',
                    'data_inscricao',
                    'data_atestado_medico',
                    'informacoes_medicas',
                    'escalao',
                ]);

            $ageGroups = DB::table('age_groups')->get(['id', 'nome']);

            foreach ($athletes as $athlete) {
                $escalaoId = null;
                $rawEscalao = $athlete->escalao;
                if (is_string($rawEscalao)) {
                    $decoded = json_decode($rawEscalao, true);
                    if (is_array($decoded) && count($decoded) > 0) {
                        $candidate = (string) $decoded[0];
                        $match = $ageGroups->first(fn ($g) => strcasecmp($g->nome, $candidate) === 0 || (string) $g->id === $candidate);
                        $escalaoId = $match?->id;
                    }
                }

                $existing = DB::table('athlete_sports_data')->where('user_id', $athlete->id)->first();

                $payload = [
                    'num_federacao' => $athlete->num_federacao,
                    'cartao_federacao' => $athlete->cartao_federacao,
                    'numero_pmb' => $athlete->numero_pmb,
                    'data_inscricao' => $athlete->data_inscricao,
                    'data_atestado_medico' => $athlete->data_atestado_medico,
                    'informacoes_medicas' => $athlete->informacoes_medicas,
                    'escalao_id' => $escalaoId,
                    'ativo' => true,
                    'updated_at' => $now,
                ];

                if ($existing) {
                    DB::table('athlete_sports_data')->where('user_id', $athlete->id)->update($payload);
                } else {
                    DB::table('athlete_sports_data')->insert([
                        'id' => (string) Str::uuid(),
                        'user_id' => $athlete->id,
                        ...$payload,
                        'created_at' => $now,
                    ]);
                }
            }
        }

        // 2) Backfill training_age_group from trainings.escaloes JSON
        if (Schema::hasTable('trainings') && Schema::hasTable('training_age_group')) {
            $trainings = DB::table('trainings')->get(['id', 'escaloes']);

            foreach ($trainings as $training) {
                if (!$training->escaloes) {
                    continue;
                }

                $decoded = is_string($training->escaloes)
                    ? json_decode($training->escaloes, true)
                    : $training->escaloes;

                if (!is_array($decoded)) {
                    continue;
                }

                foreach ($decoded as $ageGroupId) {
                    if (!is_string($ageGroupId)) {
                        continue;
                    }

                    $exists = DB::table('age_groups')->where('id', $ageGroupId)->exists();
                    if (!$exists) {
                        continue;
                    }

                    $already = DB::table('training_age_group')
                        ->where('treino_id', $training->id)
                        ->where('age_group_id', $ageGroupId)
                        ->exists();

                    if (!$already) {
                        DB::table('training_age_group')->insert([
                            'id' => (string) Str::uuid(),
                            'treino_id' => $training->id,
                            'age_group_id' => $ageGroupId,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }
            }
        }

        // 3) Backfill training_metrics from legacy training_athlete_cais_metrics
        if (Schema::hasTable('training_athlete_cais_metrics') && Schema::hasTable('training_metrics')) {
            $legacyRows = DB::table('training_athlete_cais_metrics')->get();
            foreach ($legacyRows as $row) {
                $exists = DB::table('training_metrics')->where('id', $row->id)->exists();
                if ($exists) {
                    continue;
                }

                DB::table('training_metrics')->insert([
                    'id' => $row->id,
                    'treino_id' => $row->treino_id,
                    'user_id' => $row->user_id,
                    'ordem' => $row->ordem,
                    'metrica' => $row->metrica,
                    'valor' => $row->valor,
                    'tempo' => $row->tempo,
                    'observacao' => $row->observacao,
                    'registado_por' => $row->registado_por,
                    'atualizado_por' => $row->atualizado_por,
                    'created_at' => $row->created_at ?? $now,
                    'updated_at' => $row->updated_at ?? $now,
                ]);
            }
        }

        // 4) Migrate event_results into canonical competitions/provas/results
        if (
            Schema::hasTable('event_results') &&
            Schema::hasTable('events') &&
            Schema::hasTable('competitions') &&
            Schema::hasTable('provas') &&
            Schema::hasTable('results')
        ) {
            $eventResults = DB::table('event_results')->get();

            foreach ($eventResults as $er) {
                $event = DB::table('events')->where('id', $er->evento_id)->first();
                if (!$event) {
                    continue;
                }

                $competition = DB::table('competitions')->where('evento_id', $event->id)->first();
                if (!$competition) {
                    $competitionId = (string) Str::uuid();
                    DB::table('competitions')->insert([
                        'id' => $competitionId,
                        'nome' => $event->titulo,
                        'local' => $event->local ?? 'N/A',
                        'data_inicio' => $event->data_inicio,
                        'data_fim' => $event->data_fim,
                        'tipo' => 'prova',
                        'evento_id' => $event->id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    $competitionId = $competition->id;
                }

                $provaName = (string) ($er->prova ?? 'Prova');
                preg_match('/(\d+)/', $provaName, $distMatch);
                $distance = isset($distMatch[1]) ? (int) $distMatch[1] : 0;

                $style = 'LIVRE';
                if (stripos($provaName, 'COSTAS') !== false) $style = 'COSTAS';
                if (stripos($provaName, 'BRUCOS') !== false) $style = 'BRUCOS';
                if (stripos($provaName, 'MARIPOSA') !== false) $style = 'MARIPOSA';
                if (stripos($provaName, 'ESTILOS') !== false) $style = 'ESTILOS';

                $prova = DB::table('provas')
                    ->where('competicao_id', $competitionId)
                    ->where('estilo', $style)
                    ->where('distancia_m', $distance)
                    ->first();

                if (!$prova) {
                    $provaId = (string) Str::uuid();
                    DB::table('provas')->insert([
                        'id' => $provaId,
                        'competicao_id' => $competitionId,
                        'estilo' => $style,
                        'distancia_m' => $distance,
                        'genero' => 'MISTO',
                        'escalao_id' => $er->age_group_snapshot_id,
                        'ordem_prova' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    $provaId = $prova->id;
                }

                $tempo = null;
                if (!empty($er->tempo) && preg_match('/^\d+(\.\d+)?$/', (string) $er->tempo)) {
                    $tempo = (float) $er->tempo;
                }

                $alreadyResult = DB::table('results')
                    ->where('prova_id', $provaId)
                    ->where('user_id', $er->user_id)
                    ->where('posicao', $er->classificacao)
                    ->exists();

                if (!$alreadyResult) {
                    DB::table('results')->insert([
                        'id' => (string) Str::uuid(),
                        'prova_id' => $provaId,
                        'user_id' => $er->user_id,
                        'tempo_oficial' => $tempo ?? 0,
                        'posicao' => $er->classificacao,
                        'pontos_fina' => null,
                        'desclassificado' => false,
                        'observacoes' => $er->observacoes,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Non-destructive down: keep migrated data.
    }
};
