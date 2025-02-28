import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <>
      <h1>HOOKS LIST PAGE</h1>
      <div>Hooks route refs list:</div>
      <nav>
        <ul>
          <li>
            <Link to={'/useFileSystemWithDBApi'}>useFileSystemWithDBApi</Link>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default App
