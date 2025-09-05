import api from '../lib/api'

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
}

export interface PasswordChangeResponse {
  message: string
}

// 비밀번호 변경
export const changePassword = async (passwordData: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
  const response = await api.post('/auth/change-password', passwordData)
  return response.data
}
