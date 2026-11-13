import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './components/SignUp'
import LoginPage from './components/LoginPage'
import Layout from './components/Layout'
import ReadingsPage from './Pages/ReadingsPage'
import ReportPage from './Pages/ReportPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignUp/>}/>

        {/* Pages that need a logged in user */}
        <Route element={<Layout/>}>
          <Route path="/readings" element={<ReadingsPage/>}/>
          <Route path="/reports" element={<ReportPage/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
