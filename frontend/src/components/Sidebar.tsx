import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Calendar, 
  Settings,
  X,
  Building2,
  MapPin
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// 전체 메뉴 (로그인하지 않은 상태에서도 모든 메뉴 표시)
const fullNavigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '팀 관리', href: '/teams', icon: Building2 },
  { name: '경기장 관리', href: '/venues', icon: MapPin },
  { name: '선수 관리', href: '/players', icon: Users },
  { name: '경기 관리', href: '/games', icon: Calendar },
  { name: '설정', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  
  // 모든 사용자에게 동일한 메뉴 표시
  const navigation = fullNavigation

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 사이드바 */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-sm border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* 모바일 헤더 */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h1 className="text-lg font-bold text-gray-900">Line-Up</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 데스크톱 헤더 */}
        <div className="hidden lg:block p-6">
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
                    onClick={onClose} // 모바일에서 링크 클릭 시 사이드바 닫기
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
    </>
  )
}
