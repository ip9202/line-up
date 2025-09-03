import { useState } from 'react'
import { LogIn, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'

export default function Header() {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  야구 라인업 관리
                </h1>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                홈
              </a>
              <a
                href="/players"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                선수 관리
              </a>
              <a
                href="/games"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                경기 관리
              </a>
              <a
                href="/lineups"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                라인업 관리
              </a>
            </nav>

            {/* 사용자 메뉴 */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* 사용자 정보 */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
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
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    console.log('로그인 버튼 클릭됨')
                    setShowLoginModal(true)
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인
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