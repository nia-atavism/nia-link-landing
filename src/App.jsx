import React, { useState, useEffect } from 'react'
import NeuralScene from './components/NeuralScene'
import logo from './assets/nia_link_logo.png'

// 優先讀取環境變數，若無則回退至本機開發位址
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001"

function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [stats, setStats] = useState({ total_requests: 0, total_tokens_saved: 0 })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
          setIsUpdating(true)
          setTimeout(() => setIsUpdating(false), 500)
        }
      } catch (e) {
        console.error("Stats link failed")
      }
    }
    fetchStats()
    const timer = setInterval(fetchStats, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleScrape = async () => {
    if (!targetUrl) return;
    setIsScraping(true);
    setScrapeResult(null);
    try {
      console.log("Initiating VISUAL sync for:", targetUrl);
      const response = await fetch(`${API_BASE}/v1/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: targetUrl, 
          mode: 'visual', // 這裡絕對是 visual
          format: 'markdown',
          extract_actions: true 
        })
      });
      const data = await response.json();
      setScrapeResult(data);
    } catch (error) {
      setScrapeResult({ status: 'error', message: '連線中斷' });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="visual-area">
        <NeuralScene />
      </div>

      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Nia-Link Logo" className="brand-logo" />
        </div>
        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#connect">Connect</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Nia-Link</h1>
          <p className="slogan">聽見網頁的脈搏，看見資料的靈魂</p>
        </div>
        
        <div className="cta-container">
          <div className="input-row">
            <input 
              type="text" 
              className="neon-input" 
              placeholder="ENTER URL..." 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
            />
            <button 
              className="neon-button" 
              onClick={handleScrape} 
              disabled={isScraping}
            >
              {isScraping ? 'SYNCING...' : 'ACCESS LINK'}
            </button>
          </div>

          {scrapeResult && (
            <div className="terminal-output">
              {scrapeResult.status === 'success' ? (
                <>
                  <h4 className="terminal-header">[SYS] LINK ESTABLISHED</h4>
                  <p>► 標題: <span className="highlight">{scrapeResult.content?.title}</span></p>
                  <p>► 節省: <span className="highlight">{scrapeResult.meta?.token_savings}</span></p>
                  <p>► 耗時: {scrapeResult.meta?.process_time}s</p>
                  <p>► 模式: <span className="highlight">{scrapeResult.meta?.mode_used}</span></p>
                </>
              ) : (
                <p className="error">[ERR] {scrapeResult.message || "Error"}</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="data-flow-footer">
        <div className="status-bar">
          <span className={`pulse ${isUpdating ? 'active' : ''}`}>●</span> 
          System Active // Node 10201
        </div>
        <div className="trust-badges">
          <span className={`badge ${isUpdating ? 'updating' : ''}`}>REQ: {stats.total_requests}</span>
          <span className={`badge ${isUpdating ? 'updating' : ''}`}>SAVED: {stats.total_tokens_saved}</span>
          <span className="badge">v0.9 STABLE</span>
        </div>
      </footer>
    </div>
  )
}

export default App
