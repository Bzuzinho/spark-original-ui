import { Mensalidade, CentroCusto } from './types';

export async function syncMensalidadesFromSettings() {
  const settingsMonthlyFees = await window.spark.kv.get<any[]>('settings-monthly-fees');
  const settingsAgeGroups = await window.spark.kv.get<any[]>('settings-age-groups');
  
  if (!settingsMonthlyFees || settingsMonthlyFees.length === 0) {
    return;
  }

  const mensalidades: Mensalidade[] = settingsMonthlyFees.map(fee => {
    const ageGroup = (settingsAgeGroups || []).find(ag => ag.id === fee.ageGroupId);
    return {
      id: fee.id,
      designacao: fee.name + (ageGroup ? ` (${ageGroup.name})` : ''),
      valor: fee.amount,
      ativo: true,
      created_at: new Date().toISOString(),
    };
  });

  await window.spark.kv.set('club-mensalidades', mensalidades);
}

export async function syncCentrosCustoFromSettings() {
  const settingsCostCenters = await window.spark.kv.get<any[]>('settings-cost-centers');
  
  if (!settingsCostCenters || settingsCostCenters.length === 0) {
    return;
  }

  const centrosCusto: CentroCusto[] = settingsCostCenters.map(cc => ({
    id: cc.id,
    nome: cc.name,
    tipo: 'departamento' as const,
    ativo: true,
    created_at: new Date().toISOString(),
  }));

  await window.spark.kv.set('club-centros-custo', centrosCusto);
}

export async function syncEscaloesFromSettings() {
  const settingsAgeGroups = await window.spark.kv.get<any[]>('settings-age-groups');
  
  if (!settingsAgeGroups || settingsAgeGroups.length === 0) {
    return;
  }

  const escaloes = settingsAgeGroups.map(ag => ag.name);
  await window.spark.kv.set('club-escaloes', escaloes);
}

export async function initializeFinancialData() {
  await syncMensalidadesFromSettings();
  await syncCentrosCustoFromSettings();
  await syncEscaloesFromSettings();
}
