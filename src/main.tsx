import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { FileSystemWithDBApiPage, IndexedDBPage } from './pages/index.ts'

const basename = import.meta.env.VITE_BASE_PATH || '/'
console.log(basename)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter >
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/useFileSystemWithDBApi"
          element={<FileSystemWithDBApiPage />}
        />
        <Route path="/useIndexedDB" element={<IndexedDBPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
)
