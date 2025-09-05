import api from '@/lib/api'

export const downloadLineupPDF = async (lineupId: number): Promise<void> => {
  try {
    const response = await api.get(`/pdf/lineup/${lineupId}/pdf`, {
      responseType: 'blob'
    })
    
    // Blob을 URL로 변환
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    
    // 다운로드 링크 생성
    const link = document.createElement('a')
    link.href = url
    link.download = `lineup_${lineupId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`
    
    // 링크 클릭하여 다운로드
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // URL 해제
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF 다운로드 실패:', error)
    throw error
  }
}
