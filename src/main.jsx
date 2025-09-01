import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AuthContextProvider from './context/AuthContex.jsx';
import '../src/i18n/index.js'
import './index.css'
import EmployeeContextProvider from './context/EmployeeContext.jsx';


createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <EmployeeContextProvider>
      <StrictMode>
        <App />
      </StrictMode>,
    </EmployeeContextProvider>

  </AuthContextProvider>

)
