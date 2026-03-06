/**
 * Script de teste para o browser console
 * 
 * Testa criar e apagar convocatórias através da API KV
 * 
 * Como usar:
 * 1. Abre http://localhost:5173 no browser
 * 2. Abre a consola (F12)
 * 3. Cola este script e executa
 */

async function testConvocatoriaDeleteFlow() {
  console.log('🧪 INÍCIO DO TESTE - Criar e Apagar Convocatória');
  console.log('='.repeat(60));

  try {
    // 1. Obter dados atuais
    console.log('\n📥 1. Buscar convocatórias existentes...');
    const getResponse = await fetch('/api/kv/club-convocatorias-grupo?scope=global', {
      headers: { 'Accept': 'application/json' }
    });
    const getData = await getResponse.json();
    const initialData = getData.value || [];
    console.log(`✅ Encontradas ${initialData.length} convocatórias`);
    console.log('Dados iniciais:', initialData);

    // 2. Criar nova convocatória
    console.log('\n➕ 2. Criar nova convocatória de teste...');
    const testConvocatoria = {
      id: crypto.randomUUID(),
      evento_id: 'test-event-' + Date.now(),
      data_criacao: new Date().toISOString(),
      criado_por: 'test-user',
      atletas_ids: ['atleta1', 'atleta2'],
      hora_encontro: '10:00',
      local_encontro: 'Teste Local',
      observacoes: 'TESTE - Apagar esta convocatória',
      tipo_custo: 'por_salto',
    };

    const newData = [...initialData, testConvocatoria];
    console.log(`📝 Será criada convocatória com ID: ${testConvocatoria.id}`);

    const createResponse = await fetch('/api/kv/club-convocatorias-grupo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        value: newData,
        scope: 'global'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Erro ao criar: ${createResponse.status}\n${errorText}`);
    }

    console.log('✅ Convocatória criada com sucesso!');

    // 3. Verificar se foi criada
    console.log('\n🔍 3. Verificar se foi persistida na BD...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar 500ms

    const verifyCreateResponse = await fetch('/api/kv/club-convocatorias-grupo?scope=global', {
      headers: { 'Accept': 'application/json' }
    });
    const verifyCreateData = await verifyCreateResponse.json();
    const afterCreate = verifyCreateData.value || [];
    
    const found = afterCreate.find(c => c.id === testConvocatoria.id);
    if (found) {
      console.log('✅ SUCESSO: Convocatória encontrada na BD');
      console.log(`📊 Total de convocatórias: ${afterCreate.length}`);
    } else {
      console.error('❌ FALHOU: Convocatória NÃO encontrada na BD');
      console.log('Dados retornados:', afterCreate);
    }

    // 4. Apagar convocatória
    console.log(`\n🗑️  4. Apagar convocatória ${testConvocatoria.id}...`);
    const filteredData = afterCreate.filter(c => c.id !== testConvocatoria.id);
    console.log(`📊 Antes: ${afterCreate.length} convocatórias`);
    console.log(`📊 Depois do filtro: ${filteredData.length} convocatórias`);

    const deleteResponse = await fetch('/api/kv/club-convocatorias-grupo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        value: filteredData,
        scope: 'global'
      })
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Erro ao apagar: ${deleteResponse.status}\n${errorText}`);
    }

    console.log('✅ Request de delete enviado com sucesso!');

    // 5. Verificar se foi apagada
    console.log('\n🔍 5. Verificar se foi apagada da BD...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar 500ms

    const verifyDeleteResponse = await fetch('/api/kv/club-convocatorias-grupo?scope=global', {
      headers: { 'Accept': 'application/json' }
    });
    const verifyDeleteData = await verifyDeleteResponse.json();
    const afterDelete = verifyDeleteData.value || [];
    
    const stillExists = afterDelete.find(c => c.id === testConvocatoria.id);
    if (!stillExists) {
      console.log('✅ SUCESSO: Convocatória foi APAGADA da BD');
      console.log(`📊 Total de convocatórias: ${afterDelete.length}`);
    } else {
      console.error('❌ FALHOU: Convocatória AINDA EXISTE na BD');
      console.log('Dados retornados:', afterDelete);
    }

    // Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESULTADO DO TESTE:');
    console.log(`   Criação: ${found ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`   Eliminação: ${!stillExists ? '✅ OK' : '❌ FALHOU'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testConvocatoriaDeleteFlow();
