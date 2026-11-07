import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetMemoryFallbackForTests,
  buildFavoriteRecord,
  deleteFavoriteFromDb,
  enqueueFavoriteSync,
  getAllFavoritesFromDb,
  getPendingSyncQueue,
  mirrorServerFavoritesToDb,
  normalizeRecursoTipo,
  removeSyncQueueItem,
  saveFavoriteToDb,
} from './favoritesDb.js';

test('normalizeRecursoTipo clasifica correctamente lugares, restaurantes y eventos', () => {
  assert.equal(normalizeRecursoTipo('Restaurante Mexicano'), 'restaurante');
  assert.equal(normalizeRecursoTipo('evento_cultural'), 'evento');
  assert.equal(normalizeRecursoTipo('museo'), 'lugar');
});

test('buildFavoriteRecord valida entradas y normaliza la estructura', () => {
  assert.throws(() => buildFavoriteRecord({}), /identificador válido/);

  const record = buildFavoriteRecord(
    {
      id: '66f1a2b3c4d5e6f7a8b9c0d1',
      nombre: 'Hospicio Cabañas',
      municipio: 'Guadalajara',
      tipo: 'lugar',
      rating: 4.9,
    },
    'pending_add'
  );

  assert.equal(record.referencia_id, '66f1a2b3c4d5e6f7a8b9c0d1');
  assert.equal(record.sync_status, 'pending_add');
  assert.equal(record.recurso.nombre, 'Hospicio Cabañas');
  assert.equal(record.recurso.municipio, 'Guadalajara');
});

test('almacenamiento local guarda, filtra pending_remove y elimina favoritos', async () => {
  __resetMemoryFallbackForTests();

  await saveFavoriteToDb({ id: 'p1', nombre: 'Tequila Pueblo Mágico', tipo: 'lugar' }, 'local_only');
  await saveFavoriteToDb({ id: 'p2', nombre: 'Tlaquepaque', tipo: 'lugar' }, 'pending_remove');

  const visible = await getAllFavoritesFromDb();
  assert.equal(visible.length, 1);
  assert.equal(visible[0].referencia_id, 'p1');

  const all = await getAllFavoritesFromDb({ includePendingRemove: true });
  assert.equal(all.length, 2);

  await deleteFavoriteFromDb('p1');
  const afterDelete = await getAllFavoritesFromDb();
  assert.equal(afterDelete.length, 0);
});

test('mirrorServerFavoritesToDb preserva cambios offline pendientes', async () => {
  __resetMemoryFallbackForTests();

  await saveFavoriteToDb({ id: 'offline-1', nombre: 'Lago de Chapala' }, 'pending_add');
  await mirrorServerFavoritesToDb([
    { id: 'srv-1', nombre: 'Catedral de Guadalajara', tipo: 'lugar' },
  ]);

  const stored = await getAllFavoritesFromDb();
  const ids = stored.map((item) => item.referencia_id).sort();
  assert.deepEqual(ids, ['offline-1', 'srv-1']);
});

test('enqueueFavoriteSync deduplica acciones repetidas sobre el mismo recurso', async () => {
  __resetMemoryFallbackForTests();

  await assert.rejects(
    () => enqueueFavoriteSync({ action: 'INVALID_OP', referenciaId: 'p1', tipo: 'lugar' }),
    /inválida/
  );

  await enqueueFavoriteSync({ action: 'ADD_FAVORITE', referenciaId: 'p1', tipo: 'lugar' });
  await enqueueFavoriteSync({ action: 'REMOVE_FAVORITE', referenciaId: 'p1', tipo: 'lugar' });

  const queue = await getPendingSyncQueue();
  assert.equal(queue.length, 1);
  assert.equal(queue[0].action, 'REMOVE_FAVORITE');

  await removeSyncQueueItem(queue[0].id);
  const emptyQueue = await getPendingSyncQueue();
  assert.equal(emptyQueue.length, 0);
});

