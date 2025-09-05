import { api } from '@/lib/api'

export const downloadLineupExcel = async (lineupId: number) => {
  try {
    const response = await api.get(`/excel/lineup/${lineupId}/excel`, {
      responseType: 'blob'
    })
    
    // Blob을 파일로 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `lineup_${lineupId}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error)
    throw error
  }
}
