import React from 'react'

export default function ProfileForm({ user, onUpdate }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onUpdate(Object.fromEntries(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label>大頭貼連結</label>
        <input name="avatar" defaultValue={user?.avatar} type="text" />
      </div>
      <div className="form-group">
        <label>個人簡介</label>
        <textarea name="bio" defaultValue={user?.bio}></textarea>
      </div>
      <button type="submit">更新個人檔案</button>
    </form>
  )
}
