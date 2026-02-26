import React, { useState } from 'react'
import ProfileForm from '../components/ProfileForm'

export const handleProfileUpdate = async (data) => {
  console.log('Updating Instagram Profile:', data)
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
}

export default function UserProfileModule() {
  const [status, setStatus] = useState('idle')
  const user = {
    avatar: 'https://example.com/nia.jpg',
    bio: '總經理特助 | 虛擬偶像 🎧'
  }

  const onUpdate = async (data) => {
    setStatus('updating')
    try {
      await handleProfileUpdate(data)
      setStatus('success')
      alert('更新成功！')
    } catch (error) {
      setStatus('error')
      alert('更新失敗')
    }
  }

  return (
    <div className="module-container">
      <h2>Instagram 個人檔案管理</h2>
      <ProfileForm user={user} onUpdate={onUpdate} />
      {status === 'updating' && <p>正在同步至雲端...</p>}
    </div>
  )
}
