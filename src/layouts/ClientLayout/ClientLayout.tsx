import React from 'react'
import { Outlet } from 'react-router'
import ClientHeader from './components/ClientHeader'
import ClientFooter from './components/ClientFooter'

function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <Outlet />
      <ClientFooter />
    </div>
  )
}

export default ClientLayout
