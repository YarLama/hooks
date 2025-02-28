import { Link } from 'react-router-dom'
import { useFileSystemWithDBApi } from '../../hooks'
import { useEffect, useState } from 'react'

const showFilePickerOptions: OpenFilePickerOptions = {
  multiple: true,
}

export default function FileSystemWithDBApiPage() {
  const [fileList, setFileList] = useState<File[]>([])
  const [fileTexts, setFileTexts] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [fileName, setFileName] = useState<string>('')
  const [currentFileHandle, setCurrentFileHandle] = useState<
    FileSystemFileHandle | undefined
  >(undefined)
  const fs = useFileSystemWithDBApi({
    replaceRecords: true,
  })
  const handleOpenFilePickerClick = () => {
    if (fs.isSupported) {
      fs.showFilePicker(showFilePickerOptions).then(() => {
        fs.getAllFileHandles().then((fileHandles) => {
          if (fileHandles) {
            Promise.all(
              fileHandles.map((fileHandle) =>
                fileHandle.getFile().then((file) => file)
              )
            ).then((files) => {
              setFileList(files)
            })
          }
        })
      })
    }
  }

  const handleFileClick = (name: string) => {
    if (fs.isSupported) {
      fs.getFileHandle(name).then((fileHandle) => {
        if (fileHandle) {
          fs.readFile(fileHandle as FileSystemFileHandle).then((text) => {
            if (text) {
              setFileTexts(text)
              setCurrentFileHandle(fileHandle as FileSystemFileHandle)
              fs.setCurrentFileHandle(fileHandle as FileSystemFileHandle)
            }
          })
        }
      })
    }
  }
  const handleOpenSavePickerClick = (data: string) =>
    fs.isSupported &&
    fs
      .showSavePicker(data)
      .then((handle) => handle && setCurrentFileHandle(handle))

  const handleSaveFileClick = (handle: FileSystemFileHandle, data: string) =>
    fs.isSupported && fs.saveFile(handle, data)

  const handleOpenDirectoryPickerClick = () =>
    fs.isSupported && fs.showDirectoryPicker()

  const handleTextareaChange = (e) => {
    const text = e.target.value
    setFileTexts(text)
  }

  const setCurrentFileHandleOnload = () => {
    if (fs.isSupported) {
      fs.getCurrentFileHandle().then((fileHandle) => {
        if (fileHandle) {
          fileHandle.queryPermission({ mode: 'read' }).then((permission) => {
            if (permission === 'prompt') {
              fileHandle.requestPermission({ mode: 'read' })
            }
          })
          setCurrentFileHandle(fileHandle)
        }
      })
    }
  }

  const setFileListOnload = () => {
    if (fs.isSupported) {
      fs.getAllFileHandles().then((fileHandles) => {
        if (fileHandles) {
          Promise.all(
            fileHandles.map((fileHandle) => {
              return fileHandle.getFile().then((file) => file)
            })
          ).then((files) => {
            setFileList(files)
          })
        }
      })
    }
  }

  useEffect(() => {
    if (currentFileHandle) {
      currentFileHandle.getFile().then((file) => {
        setFileName(file.name)
        setFileSize(file.size)
        if (!fileTexts) {
          file.text().then((text) => setFileTexts(text))
        }
      })
    }
  }, [currentFileHandle])

  useEffect(() => {
    setFileListOnload()
    setCurrentFileHandleOnload()
  }, [])

  return (
    <div>
      <div>
        <Link to={'/'}>Back</Link>
      </div>
      <p>{`${fs.isSupported ? 'supported' : 'not supported'}`}</p>
      {fs.isSupported ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button onClick={handleOpenFilePickerClick}>Show File Picker</button>
          <button onClick={handleOpenDirectoryPickerClick}>
            Show Directory Picker
          </button>
          {fileList
            ? fileList.map((file) => (
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
