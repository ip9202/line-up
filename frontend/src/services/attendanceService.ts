import api from '../lib/api'

// 출석 상태 조회
export const getAttendance = async (lineupId: number): Promise<{ [playerId: number]: boolean }> => {
  const response = await api.get(`/lineups/${lineupId}/attendance`)
  return response.data.attendance || {}
}

// 출석 상태 저장
export const updateAttendance = async (lineupId: number, attendance: { [playerId: number]: boolean }): Promise<void> => {
  await api.put(`/lineups/${lineupId}/attendance`, { attendance })
}
