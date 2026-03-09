<?php

namespace App\Services\Desportivo;

use App\Models\AgeGroup;
use App\Models\Event;
use App\Models\Training;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Action: Criar Treino Completo
 * 
 * Responsabilidade:
 * - Criar Training
 * - Criar Event associado (tipo='treino')
 * - Sincronizar escalões ao Event
 * - Pré-criar registos de training_athletes para atletas elegíveis
 * - Pré-criar event_attendances (espelho) automaticamente via Observer
 * 
 * Garante transação DB completa: se qualquer etapa falhar, rollback total
 */
class CreateTrainingAction
{
    public function __construct(
        private PrepareTrainingAthletesAction $prepareAthletesAction,
        private SyncTrainingToEventAction $syncToEventAction
    ) {}

    /**
     * Executa criação de treino completo
     * 
     * @param array $data Dados do treino
     * @param User $criadoPor User que está criando
     * @return Training
     * @throws ValidationException
     * @throws \Exception
     */
    public function execute(array $data, User $criadoPor): Training
    {
        // Validação básica
        $this->validate($data);

        DB::beginTransaction();

        try {
            // 1. Criar Training
            $training = $this->createTraining($data, $criadoPor);

            // 2. Criar Event associado
            $event = $this->createAssociatedEvent($training, $data);

            // 3. Linkar Training → Event
            $training->update(['evento_id' => $event->id]);

            // 4. Sincronizar escalões ao Event
            if (!empty($data['escaloes'])) {
                $event->ageGroups()->sync($data['escaloes']);
            }

            // 5. Pré-criar training_athletes for atletas elegíveis
            $this->prepareAthletesAction->execute($training, $data['escaloes'] ?? []);

            // 6. Sincronizar para event_attendances (observer handled, mas forçar explicitamente)
            $this->syncToEventAction->execute($training);

            DB::commit();

            Log::info('Training created successfully', [
                'training_id' => $training->id,
                'event_id' => $event->id,
                'created_by' => $criadoPor->id,
            ]);

            return $training->fresh(['event', 'athleteRecords', 'ageGroups']);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create training', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Validação de dados
     */
    private function validate(array $data): void
    {
        $rules = [
            'data' => 'required|date',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fim' => 'nullable|date_format:H:i|after:hora_inicio',
            'local' => 'nullable|string|max:255',
            'epoca_id' => 'nullable|uuid|exists:seasons,id',
            'microciclo_id' => 'nullable|uuid|exists:microcycles,id',
            'tipo_treino' => 'required|string|max:30',
            'volume_planeado_m' => 'nullable|integer|min:0',
            'escaloes' => 'nullable|array',
            'escaloes.*' => 'uuid|exists:age_groups,id',
        ];

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Cria registo de Training
     */
    private function createTraining(array $data, User $criadoPor): Training
    {
        return Training::create([
            'numero_treino' => $this->generateNumeroTreino($data['data']),
            'data' => $data['data'],
            'hora_inicio' => $data['hora_inicio'] ?? null,
            'hora_fim' => $data['hora_fim'] ?? null,
            'local' => $data['local'] ?? null,
            'epoca_id' => $data['epoca_id'] ?? null,
            'microciclo_id' => $data['microciclo_id'] ?? null,
            'tipo_treino' => $data['tipo_treino'],
            'volume_planeado_m' => $data['volume_planeado_m'] ?? null,
            'notas_gerais' => $data['notas_gerais'] ?? null,
            'descricao_treino' => $data['descricao_treino'] ?? null,
            'escaloes' => $data['escaloes'] ?? null,
            'criado_por' => $criadoPor->id,
        ]);
    }

    /**
     * Cria Event associado ao Training
     */
    private function createAssociatedEvent(Training $training, array $data): Event
    {
        return Event::create([
            'tipo' => 'treino',
            'titulo' => $this->generateEventNome($training, $data),
            'data_inicio' => $training->data,
            'hora_inicio' => $training->hora_inicio,
            'data_fim' => $training->data,
            'hora_fim' => $training->hora_fim,
            'local' => $training->local,
            'descricao' => $training->descricao_treino ?? 'Treino',
            'criado_por' => $training->criado_por,
            'estado' => 'agendado',
        ]);
    }

    /**
     * Gera número de treino (ex: T-2026-03-09-001)
     */
    private function generateNumeroTreino(string $data): string
    {
        $date = \Carbon\Carbon::parse($data);
        $countOnDate = Training::whereDate('data', $date)->count();
        
        return sprintf('T-%s-%03d', $date->format('Y-m-d'), $countOnDate + 1);
    }

    /**
     * Gera nome do evento baseado no treino
     */
    private function generateEventNome(Training $training, array $data): string
    {
        $escaloes = $data['escaloes'] ?? [];
        $escaloesNomes = !empty($escaloes)
            ? AgeGroup::whereIn('id', $escaloes)->pluck('nome')->implode(', ')
            : ucfirst((string) $training->tipo_treino);
        $date = \Carbon\Carbon::parse($training->data)->format('d/m/Y');
        
        return "Treino - {$escaloesNomes} ({$date})";
    }
}
