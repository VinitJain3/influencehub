import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/Toast'

export default function AppLayout({ role, children }) {
  return (
    <div>
      <Navbar variant="app" />
      <div className="flex" style={{ marginTop: 56 }}>
        <Sidebar role={role} />
        <main
          className="flex-1 min-h-[calc(100vh-56px)] overflow-y-auto"
          style={{
            marginLeft: 232,
            padding: 28,
            background: '#F5F5F0',
          }}
        >
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
