type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle

const dbName = 'fileHandlesDB'
const storeName = 'fileHandles'
const storeStateName = 'fileHandleState'
const storeStateCurrentFileHandle = 'currentFileHandle'
const openDB = function (): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = function (e) {
      const db = (e.target as IDBRequest).result as IDBDatabase
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
      if (!db.objectStoreNames.contains(storeStateName)) {
        db.createObjectStore(storeStateName).put(null, storeStateCurrentFileHandle)
      }
    }

    request.onsuccess = (e) =>
      resolve((e.target as IDBRequest).result as IDBDatabase)
    request.onerror = () => reject(request.error)
  })
}

const saveFileHandleToIndexedDB = function (
  fileHandle: FileSystemHandle,
  key?: string
): Promise<void> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    return new Promise<void>((resolve, reject) => {
      const request = store.autoIncrement
        ? store.add(fileHandle)
        : store.put(fileHandle, key ?? fileHandle.name)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
}

const getAllRecordsFromIndexedDB = function (): Promise<
  FileSystemHandle[] | null
> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)

    return new Promise<FileSystemHandle[] | null>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  })
}

const getFileHandleFromIndexedDB = function (
  key: string
): Promise<FileSystemHandle | null> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)

    return new Promise<FileSystemHandle | null>((resolve, reject) => {
      const request = store.get(key)

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  })
}

const getCurrentFileHandleFromState = function() {
  return openDB().then((db) => {
    const transaction = db.transaction(storeStateName, 'readonly')
    const store = transaction.objectStore(storeStateName)
    return new Promise<FileSystemFileHandle | null>((resolve, reject) => {
      const request = store.get(storeStateCurrentFileHandle)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })
}

const setCurrentFileHandleFromState = function(fileHandle: FileSystemFileHandle) {
  return openDB().then((db) => {
    const transaction = db.transaction(storeStateName, 'readwrite')
    const store = transaction.objectStore(storeStateName)
    return new Promise<void>((resolve, reject) => {
      const request = store.put(fileHandle, storeStateCurrentFileHandle);

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
}

const removeFileHandleFromIndexedDB = function (key: string): Promise<void> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
}

const updateFileHandleFromIndexedDB = function (
  key: string,
  value: FileSystemHandle
): Promise<void> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    return new Promise<void>((resolve, reject) => {
      const request = store.put(value, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
}

const clearStoreFromIndexedDB = function (): Promise<void> {
  return openDB().then((db) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    return new Promise<void>((resolve, reject) => {
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  })
}

export {
  saveFileHandleToIndexedDB,
  setCurrentFileHandleFromState,
  getCurrentFileHandleFromState,
  getFileHandleFromIndexedDB,
  getAllRecordsFromIndexedDB,
  removeFileHandleFromIndexedDB,
  updateFileHandleFromIndexedDB,
  clearStoreFromIndexedDB,
}
