import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import './styles/custom.css'
import './components/design-versions/design-versions.css'
import { DesignVersionProvider } from './components/design-versions/DesignVersionProvider'
import { DesignVersionMenu } from './components/design-versions/DesignVersionMenu'
import { MAJOR_VERSIONS } from './data/designVersions'
import shippedDefaults from './data/designDefaults.json'
import { startIntro } from './lib/intro'

const loadVersionHistory = () => import('./data/versionHistory.json')

startIntro()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DesignVersionProvider
      enabled={import.meta.env.DEV || import.meta.env.VITE_DESIGN_VERSIONS === '1'}
      majors={MAJOR_VERSIONS}
      defaults={shippedDefaults}
    >
      <App />
      <DesignVersionMenu loadHistory={loadVersionHistory} />
    </DesignVersionProvider>
  </React.StrictMode>,
)
