import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FileSystemWithDBApiPage from './pages/FileSystemWithDBApi/FileSystemWithDBApi.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/useFileSystemWithDBApi" element={<FileSystemWithDBApiPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
