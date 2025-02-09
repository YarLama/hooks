import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FileSystemApiPage from './pages/FileSystemApi/FileSystemApi.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/useFileSystemApi" element={<FileSystemApiPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
