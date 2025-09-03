import { useState } from 'react'
import { LogIn, LogOut, User, Settings, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  
  // 디버깅용 로그
  console.log('Header 렌더링:', { user, isAuthenticated, showLoginModal })

  const handleLogout = () => {
    if (window.confirm('정말로 로그아웃하시겠습니까?')) {
      logout()
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* 로고 */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  야구 라인업 관리
                </h1>
              </div>
            </div>

            {/* 사용자 메뉴 */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* 사용자 정보 */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.role}
                      </div>
                    </div>
                  </div>

                  {/* 로그아웃 버튼 */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    console.log('로그인 버튼 클릭됨')
                    setShowLoginModal(true)
                  }}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}