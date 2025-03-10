interface IndexedDBOptions {
  dbName: string
  dbVersion?: number
}

export interface IndexItem {
  name: string
  keyPath: string | Iterable<string>
  options?: IDBIndexParameters
}

function useIndexedDB() {
  const openDB = function (options: IndexedDBOptions): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(options.dbName, options.dbVersion)
      request.onsuccess = (e) => {
        resolve((e.target as IDBRequest).result as IDBDatabase)
      }
      request.onerror = () => reject(request.error)
    })
  }

  function createStore(
    db: IDBDatabase,
    storeName: string,
    options?: IDBObjectStoreParameters,
    indexList?: IndexItem[]
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (db.objectStoreNames.contains(storeName)) {
        resolve(db)
        return
      }

      const newVersion = db.version + 1
      db.close()
      const request = indexedDB.open(db.name, newVersion)

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBRequest).result as IDBDatabase
        const store = db.createObjectStore(storeName, options)
        if (store.keyPath && indexList) {
          indexList.forEach((index) => {
            store.createIndex(index.name, index.keyPath, index.options)
          })
        }
      }

      request.onsuccess = (e) => {
        const db = (e.target as IDBRequest).result as IDBDatabase
        resolve(db)
      }

      request.onerror = (e) => {
        reject((e.target as IDBRequest).error)
      }
    })
  }

  function createIndex(
    db: IDBDatabase,
    storeName: string,
    indexKey: string,
    primaryKey: string
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const newVersion = db.version + 1
      db.close()
      const request = indexedDB.open(db.name, newVersion)

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBRequest).result as IDBDatabase
        const transaction = db.transaction(storeName, 'readwrite')
        transaction.onerror = () => reject(transaction.error)
        const store = transaction.objectStore(storeName)

        if (!store.indexNames.contains(indexKey)) {
          store.createIndex(indexKey, primaryKey, { unique: true })
        }
      }

      request.onsuccess = (e) => {
        const db = (e.target as IDBRequest).result as IDBDatabase
        resolve(db)
      }

      request.onerror = (e) => {
        reject((e.target as IDBRequest).error)
      }
    })
  }

  function addRecord(
    db: IDBDatabase,
    storeName: string,
    data: any,
    key?: string
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      transaction.onerror = () => reject(transaction.error)
      const store = transaction.objectStore(storeName)
      const request =
        store.autoIncrement || store.keyPath
          ? store.add(data)
          : store.put(data, key)

      request.onsuccess = () => resolve(db)
      request.onerror = () => reject(request.error)
    })
  }

  function getValue(
    db: IDBDatabase,
    storeName: string,
    key: IDBValidKey | IDBKeyRange
  ) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      transaction.onerror = () => reject(transaction.error)
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = (e) => {
        const value = (e.target as IDBRequest).result
        if (value) resolve(value)
        reject(undefined)
      }

      request.onerror = () => reject(request.error)
    })
  }

  function getValueFromIndex(
    db: IDBDatabase,
    storeName: string,
    indexName: string,
    key: string
  ) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      transaction.onerror = () => reject(transaction.error)
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.get(key)

      request.onsuccess = (e) => {
        const value = (e.target as IDBRequest).result
        if (value) resolve(value)
        reject(undefined)
      }

      request.onerror = () => reject(request.error)
    })
  }

  function getAllValue(db: IDBDatabase, storeName: string, key?: string) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      transaction.onerror = () => reject(transaction.error)
      const store = transaction.objectStore(storeName)
      const request = store.getAll(key)

      request.onsuccess = (e) => {
        const value = (e.target as IDBRequest).result
        if (value) resolve(value)
        resolve([])
      }

      request.onerror = () => reject(request.error)
    })
  }

  function getAllValueFromIndex(
    db: IDBDatabase,
    storeName: string,
    indexName: string,
    key?: string
  ) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      transaction.onerror = () => reject(transaction.error)
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(key)

      request.onsuccess = (e) => {
        const value = (e.target as IDBRequest).result
        if (value) resolve(value)
        resolve([])
      }

      request.onerror = () => reject(request.error)
    })
  }
  return {
    init: openDB,
    createStore: createStore,
    createIndex: createIndex,
    addRecord: addRecord,
    getValue: getValue,
    getValueFromIndex: getValueFromIndex,
    getAllValue: getAllValue,
    getAllValueFromIndex: getAllValueFromIndex,
  }
}

export default useIndexedDB
