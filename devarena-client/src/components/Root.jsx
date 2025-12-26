import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const Root = () => {
 return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}

export default Root
