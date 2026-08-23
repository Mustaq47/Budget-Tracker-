import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'coZifyDB';
const DB_VERSION = 1;

export async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Transactions Store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('userId', 'userId', { unique: false });
        txStore.createIndex('userId_date', ['userId', 'date'], { unique: false });
        txStore.createIndex('userId_syncStatus', ['userId', 'syncStatus'], { unique: false });
        txStore.createIndex('userId_updatedAt', ['userId', 'updatedAt'], { unique: false });
        txStore.createIndex('userId_walletId', ['userId', 'walletId'], { unique: false });
        txStore.createIndex('userId_tripId', ['userId', 'tripId'], { unique: false });
        txStore.createIndex('userId_goalId', ['userId', 'goalId'], { unique: false });
        txStore.createIndex('userId_category', ['userId', 'category'], { unique: false });
      }

      // 2. Sync Queue Store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'queueId' });
        queueStore.createIndex('userId', 'userId', { unique: false });
        queueStore.createIndex('userId_status', ['userId', 'status'], { unique: false });
      }

      // 3. Metadata Store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'userId' });
      }
    },
  });
}
