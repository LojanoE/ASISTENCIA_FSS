import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  QrCode,
  Home,
} from 'lucide-react'

export function Layout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <span className="text-xl">🌴</span>
            <span className="hidden sm:inline">Finca San Luis</span>
            <span className="sm:hidden">FSS</span>
          </NavLink>

          <div className="flex items-center gap-2">
            {session && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {session.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  session.role === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {session.role === 'admin' ? 'Admin' : 'Trabajador'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {session && (
        <nav className="bg-white border-b border-gray-200 sticky top-14 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                Inicio
              </NavLink>

              {session.role === 'admin' && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                  </NavLink>
                  <NavLink
                    to="/admin/workers"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Users className="w-4 h-4" />
                    Trabajadores
                  </NavLink>
                  <NavLink
                    to="/admin/attendance"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <ClipboardList className="w-4 h-4" />
                    Asistencias
                  </NavLink>
                  <NavLink
                    to="/admin/settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Settings className="w-4 h-4" />
                    Config
                  </NavLink>
                  <NavLink
                    to="/qr"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <QrCode className="w-4 h-4" />
                    QR
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}