import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Calendar, 
  ClipboardList, 
  FileText,
  Settings 
} from 'lucide-react'

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '선수 관리', href: '/players', icon: Users },
  { name: '경기 관리', href: '/games', icon: Calendar },
  { name: '라인업 생성', href: '/lineup/editor', icon: ClipboardList },
  { name: '라인업 목록', href: '/lineup/list', icon: FileText },
  { name: '설정', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Line-Up</h1>
        <p className="text-sm text-gray-600 mt-1">야구 라인업 관리</p>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
