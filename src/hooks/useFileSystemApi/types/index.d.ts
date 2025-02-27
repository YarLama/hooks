export {}

declare global {
  interface FileSystemHandle {
    queryPermission(
      descriptor?: FileSystemHandlePermissionDescriptor
    ): Promise<PermissionState>
    requestPermission(
      descriptor?: FileSystemHandlePermissionDescriptor
    ): Promise<PermissionState>
  }

  type FileExtension = `.${string}`
  type MIMEType = `${string}/${string}`

  interface FilePickerAcceptType {
    // @default ""
    description?: string | undefined
    accept?: Record<MIMEType, FileExtension | FileExtension[]> | undefined
  }

  type WellKnownDirectory =
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'

  interface FilePickerOptions {
    types?: FilePickerAcceptType[] | undefined
     // @default false
    excludeAcceptAllOption?: boolean | undefined
    startIn?: WellKnownDirectory | FileSystemHandle | undefined
    id?: string | undefined
  }

  interface OpenFilePickerOptions extends FilePickerOptions {
    // @default false
    multiple?: boolean | undefined
  }

  interface SaveFilePickerOptions extends FilePickerOptions {
    suggestedName?: string | undefined
  }

  type FileSystemPermissionMode = 'read' | 'readwrite'

  interface DirectoryPickerOptions {
    id?: string | undefined
    startIn?: WellKnownDirectory | FileSystemHandle | undefined
    // @default "read"
    mode?: FileSystemPermissionMode | undefined
  }

  interface FileSystemPermissionDescriptor extends PermissionDescriptor {
    handle: FileSystemHandle
    // @default "read"
    mode?: FileSystemPermissionMode | undefined
  }

  interface FileSystemHandlePermissionDescriptor {
    // @default "read"
    mode?: FileSystemPermissionMode | undefined
  }

  function showOpenFilePicker(
    options?: OpenFilePickerOptions & { multiple?: false | undefined }
  ): Promise<[FileSystemFileHandle]>
  function showOpenFilePicker(
    options?: OpenFilePickerOptions
  ): Promise<FileSystemFileHandle[]>
  function showSaveFilePicker(
    options?: SaveFilePickerOptions
  ): Promise<FileSystemFileHandle>
  function showDirectoryPicker(
    options?: DirectoryPickerOptions
  ): Promise<FileSystemDirectoryHandle>
}
