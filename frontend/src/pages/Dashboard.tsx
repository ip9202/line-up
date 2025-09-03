import { Users, Calendar, ClipboardList, FileText } from 'lucide-react'

const stats = [
  {
    name: '총 선수',
    value: '25',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: '예정된 경기',
    value: '3',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: '저장된 라인업',
    value: '12',
    icon: ClipboardList,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: '이번 달 경기',
    value: '8',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">대시보드</h1>
        <p className="page-subtitle">
          야구 라인업 관리 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">최근 경기</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">vs LG 트윈스</p>
                  <p className="text-sm text-gray-500">2024-12-25 14:00</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  예정
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">vs 두산 베어스</p>
                  <p className="text-sm text-gray-500">2024-12-22 18:30</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  완료
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">최근 라인업</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">12월 25일 라인업</p>
                  <p className="text-sm text-gray-500">vs LG 트윈스</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  기본
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">12월 22일 라인업</p>
                  <p className="text-sm text-gray-500">vs 두산 베어스</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  백업
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
