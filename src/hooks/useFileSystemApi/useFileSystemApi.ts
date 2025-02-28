const isHookSupported = !!window.showOpenFilePicker

interface FileSystemState {
  showFilePicker: (
    options?: OpenFilePickerOptions
  ) => Promise<FileSystemFileHandle[]>
  showDirectoryPicker: (
    options?: DirectoryPickerOptions
  ) => Promise<void | FileSystemDirectoryHandle>
  saveFile: (
    data: string,
    handle?: FileSystemFileHandle,
    options?: SaveFilePickerOptions
  ) => Promise<ResponseResult>
  getFileHandleWithPermissions: (
    fileHandle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ) => Promise<FileSystemFileHandle>
  readFile: (fileHandle: FileSystemFileHandle) => Promise<string>
}
type ResponseResult = {
  success: boolean
  message: string
}
type useFileSystemState =
  | { isSupported: false }
  | ({ isSupported: true } & FileSystemState)

function useFileSystemApi(): useFileSystemState {
  if (!isHookSupported) return { isSupported: false }

  const getFileHandleWithPermissions = (
    fileHandle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<FileSystemFileHandle> => {
    return new Promise((resolve, reject) => {
      fileHandle.queryPermission({ mode: mode }).then((permission) => {
        if (permission === 'granted') {
          resolve(fileHandle)
        }
        if (permission === 'prompt') {
          fileHandle.requestPermission({ mode: mode }).then((newPermission) => {
            if (newPermission === 'granted') {
              resolve(fileHandle)
            }
            reject(
              `${fileHandle.name} error requestPermission with ${mode} mode.`
            )
          })
        }
        reject(`${fileHandle.name} error queryPermission with ${mode} mode.`)
      })
    })
  }

  const showOpenFilePickerHandle = (
    options?: OpenFilePickerOptions
  ): Promise<FileSystemFileHandle[]> => {
    return new Promise((resolve, reject) => {
      window
        .showOpenFilePicker(options ?? {})
        .then((fileHandles: FileSystemFileHandle[]) => {
          if (!fileHandles.length) {
            reject(null)
          } else if (fileHandles.length === 1) {
            resolve(fileHandles)
          } else {
            resolve(fileHandles)
          }
        })
    })
  }

  const showDirectoryPicker = (
    options?: DirectoryPickerOptions
  ): Promise<void | FileSystemDirectoryHandle> => {
    return window.showDirectoryPicker(options ?? {}).then((handle) => {
      return handle
    })
  }

  const saveFile = (
    data: string,
    handle?: FileSystemFileHandle,
    options?: SaveFilePickerOptions
  ): Promise<ResponseResult> => {
    return new Promise((resolve, reject) => {
      if (handle) {
        writeFile(handle, data)
          .then((response) => {
            resolve(response)
          })
          .catch((e) => {
            reject(e)
          })
      } else {
        window
          .showSaveFilePicker(options ?? {})
          .then((handle: FileSystemFileHandle) => {
            writeFile(handle, data)
              .then((response) => {
                resolve(response)
              })
              .catch((e) => {
                reject(e)
              })
          })
      }
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
  ): Promise<ResponseResult> => {
    return new Promise<ResponseResult>(
      (resolve, reject: (reason: ResponseResult) => void) => {
        fileHandle
          .createWritable()
          .then((writable) => {
            writable
              .write(data)
              .then(() => {
                writable.close()
                resolve({
                  success: true,
                  message: `file: ${fileHandle.name} saved successfully.`,
                })
              })
              .catch((e) => {
                reject({
                  success: false,
                  message: `file: ${fileHandle.name} saved with error. Error: (${e}).`,
                })
              })
          })
          .catch((e) => {
            reject({
              success: false,
              message: `file: ${fileHandle.name} error create writable. Error: (${e})`,
            })
          })
      }
    )
  }

  return {
    isSupported: true,
    showFilePicker: showOpenFilePickerHandle,
    showDirectoryPicker: showDirectoryPicker,
    getFileHandleWithPermissions: getFileHandleWithPermissions,
    readFile: readFile,
    saveFile: saveFile,
  }
}

export default useFileSystemApi
