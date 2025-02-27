import {
  saveFileHandleToIndexedDB,
  getFileHandleFromIndexedDB,
  clearStoreFromIndexedDB,
  getAllRecordsFromIndexedDB,
  setCurrentFileHandleFromState,
  getCurrentFileHandleFromState,
} from './utils/indexedDB.ts'

const isHookSupported = !!window.showOpenFilePicker

interface FileSystemState {
  showFilePicker: (options?: OpenFilePickerOptions) => Promise<void[]>
  showDirectoryPicker: (
    options?: DirectoryPickerOptions
  ) => Promise<void | FileSystemDirectoryHandle>
  showSavePicker: (
    data: string,
    options?: SaveFilePickerOptions
  ) => Promise<void | FileSystemFileHandle>
  setCurrentFileHandle: (fileHandle: FileSystemFileHandle) => Promise<void>
  getFileHandle: (key: string) => Promise<FileSystemHandle | null>
  getAllFileHandles: () => Promise<FileSystemFileHandle[] | null>
  getCurrentFileHandle: () => Promise<FileSystemFileHandle | null>
  saveFile: (handle: FileSystemFileHandle, data: string) => void
  readFile: (fileHandle: FileSystemFileHandle) => Promise<string>
}
type useFileSystemState =
  | { isSupported: false }
  | ({ isSupported: true } & FileSystemState)

type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle
type FileSystemApiConfig = {
  replaceRecords?: boolean
}

function useFileSystemApi(config?: FileSystemApiConfig): useFileSystemState {

  if (!isHookSupported) return { isSupported: false }

  const getFileHandleWithPermissions = (
    fileHandle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<FileSystemFileHandle> => {
    return fileHandle.queryPermission({ mode: mode }).then((permission) => {
      if (permission === 'granted') {
        return fileHandle
      }
      if (permission === 'prompt') {
        return fileHandle
          .requestPermission({ mode: mode })
          .then((newPermission) => {
            if (newPermission === 'granted') {
              return fileHandle
            }
            return Promise.reject(
              `User agent is not allowed ${mode} permission request`
            )
          })
      }
      return Promise.reject(
        `User agent is not allowed ${mode} permission request`
      )
    })
  }

  const showOpenFilePickerHandle = (
    options?: OpenFilePickerOptions
  ): Promise<void[]> => {
    return window
      .showOpenFilePicker(options ?? {})
      .then((fileHandles: FileSystemFileHandle[]) => {
        if (fileHandles) {
          if (config?.replaceRecords) {
            clearStoreFromIndexedDB()
          }
          if (fileHandles.length > 1) {
            for (const fileHandle of fileHandles) {
              saveFileHandleToIndexedDB(fileHandle, fileHandle.name)
            }
          } else {
            saveFileHandleToIndexedDB(fileHandles[0], fileHandles[0].name)
          }
        }
        return Promise.all(
          fileHandles.map((fileHandle: FileSystemFileHandle) => {
            getFileHandleWithPermissions(fileHandle, 'read').then(
              (fileHandle) => {
                if (fileHandle)
                  return fileHandle.getFile().then((file: File) => {
                    return file
                  })
              }
            )
          })
        )
      })
  }
  const showSaveFilePicker = (
    data: string,
    options?: SaveFilePickerOptions
  ): Promise<void | FileSystemFileHandle> => {
    return window
      .showSaveFilePicker(options ?? {})
      .then((handle: FileSystemFileHandle) => {
        writeFile(handle, data)
        if (config?.replaceRecords) {
          clearStoreFromIndexedDB()
        }
        saveFileHandleToIndexedDB(handle)
        return handle
      })
  }

  const saveFile = (handle: FileSystemFileHandle, data: string): void => {
    writeFile(handle, data).catch((e) => {
      console.error(e)
    })
  }

  const showDirectoryPicker = (
    options?: DirectoryPickerOptions
  ): Promise<void | FileSystemDirectoryHandle> => {
    return window.showDirectoryPicker(options ?? {}).then((handle) => {
      if (config?.replaceRecords) {
        clearStoreFromIndexedDB()
      }
      return handle
    })
  }

  const getFileHandle = (key: string): Promise<FileSystemHandle | null> => {
    return getFileHandleFromIndexedDB(key).then((result) => {
      return result
    })
  }

  const getAllFileHandles = (): Promise<FileSystemFileHandle[] | null> => {
    return getAllRecordsFromIndexedDB().then((records) => {
      if (records) {
        return records.filter((el) => el.kind === 'file')
      }
      return null
    })
  }

  const readFile = (fileHandle: FileSystemFileHandle): Promise<string> => {
    return fileHandle.getFile().then((file: File) => {
      return file.text().then((text) => {
        return text
      })
    })
  }

  const writeFile = (
    fileHandle: FileSystemFileHandle,
    data: string
  ): Promise<void> => {
    return fileHandle.createWritable().then((writable) => {
      return writable
        .write(data)
        .then(() => {
          return writable.close()
        })
        .catch((e) => {
          console.error(`Error save ${fileHandle.name}: ${e}`)
        })
    })
  }

  const setCurrentFileHandleFromDB = (fileHandle: FileSystemFileHandle) => {
    return setCurrentFileHandleFromState(fileHandle)
  }

  const getCurrentFileHandleFromDB = () => {
    return getCurrentFileHandleFromState().then((fileHandle) => fileHandle)
  }

  return {
    isSupported: true,
    showFilePicker: showOpenFilePickerHandle,
    showDirectoryPicker: showDirectoryPicker,
    showSavePicker: showSaveFilePicker,
    setCurrentFileHandle: setCurrentFileHandleFromDB,
    getFileHandle: getFileHandle,
    getCurrentFileHandle: getCurrentFileHandleFromDB,
    getAllFileHandles: getAllFileHandles,
    readFile: readFile,
    saveFile: saveFile,
  }
}

export default useFileSystemApi
