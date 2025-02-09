import { Link } from 'react-router-dom'
import { useFileSystemApi } from '../../hooks'
import { useEffect, useState } from 'react'

export default function FileSystemApiPage() {
  const [fileTexts, setFileTexts] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [fileName, setFileName] = useState<string>('')
  const [currentFileHandle, setCurrentFileHandle] = useState<
    FileSystemFileHandle | undefined
  >(undefined)
  const tf = useFileSystemApi({
    replaceRecords: true,
    searchExistingFiles: true,
  })
  const handleOpenFilePickerClick = () =>
    tf.isSupported && tf.showFilePicker({ multiple: true })

  const handleFileClick = (name: string) => {
    if (tf.isSupported) {
      tf.getFileHandle(name).then((fileHandle) => {
        if (fileHandle) {
          tf.readFile(fileHandle as FileSystemFileHandle).then((text) => {
            if (text) {
              setFileTexts(text)
              setCurrentFileHandle(fileHandle as FileSystemFileHandle)
              tf.setCurrentFileHandle(fileHandle as FileSystemFileHandle)
            }
          })
        }
      })
    }
  }
  const handleOpenSavePickerClick = (data: string) =>
    tf.isSupported &&
    tf
      .showSavePicker(data)
      .then((handle) => handle && setCurrentFileHandle(handle))

  const handleSaveFileClick = (handle: FileSystemFileHandle, data: string) =>
    tf.isSupported && tf.saveFile(handle, data)

  const handleOpenDirectoryPickerClick = () =>
    tf.isSupported && tf.showDirectoryPicker()

  const handleTextareaChange = (e) => {
    const text = e.target.value
    setFileTexts(text)
  }

  useEffect(() => {
    if (currentFileHandle) {
      currentFileHandle.getFile().then((file) => {
        setFileName(file.name)
        setFileSize(file.size)
        if (!fileTexts) {
          file.text().then(text => setFileTexts(text))
        }
      })
    }
  }, [currentFileHandle])

  useEffect(() => {
    if (tf.isSupported) {
      tf.getCurrentFileHandle().then((fileHandle) => {
        if (fileHandle) {
          setCurrentFileHandle(fileHandle)
        }
      })
    }
  }, [])

  return (
    <div>
      <div>
        <Link to={'/'}>Back</Link>
      </div>
      <p>{`${tf.isSupported ? 'supported' : 'not supported'}`}</p>
      {tf.isSupported ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button onClick={handleOpenFilePickerClick}>Show File Picker</button>
          <button onClick={handleOpenDirectoryPickerClick}>
            Show Directory Picker
          </button>
          {tf.files
            ? tf.files.map((file) => (
                <div
                  style={{ border: '1px solid black', display: 'flex' }}
                  key={file.name}
                  onClick={() => handleFileClick(file.name)}
                >
                  {file.name}, {file.size}
                </div>
              ))
            : null}
          <br />
          {currentFileHandle && (
            <p>{`Current file is: ${fileName}, size: ${fileSize}`}</p>
          )}
          <br />
          <div>
            <button
              onClick={() =>
                currentFileHandle
                  ? handleSaveFileClick(currentFileHandle, fileTexts)
                  : handleOpenSavePickerClick(fileTexts)
              }
              disabled={!fileTexts}
            >
              Save
            </button>
            <button
              onClick={() => handleOpenSavePickerClick(fileTexts)}
              disabled={!fileTexts}
            >
              Save as
            </button>
          </div>
          <br />
          <textarea
            onChange={handleTextareaChange}
            value={fileTexts}
            rows={25}
            cols={80}
          ></textarea>
        </div>
      ) : null}
    </div>
  )
}
