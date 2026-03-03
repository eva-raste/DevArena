"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X, Code2, Zap, ChevronRight } from "lucide-react"
import { useAuth } from "./authentication/AuthContext"
import { useThemeStore } from "@/store/useThemeStore"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <style>{`
        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          height: 60px;
          transition: height 0.3s ease;
        }
        .nav-root.scrolled { height: 54px; }

        .nav-glass {
          position: absolute;
          inset: 0;
          background: rgba(2, 2, 9, 0.5);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid rgba(129, 140, 248, 0.08);
          transition: all 0.3s ease;
        }
        .nav-root.scrolled .nav-glass {
          background: rgba(2, 2, 9, 0.82);
          border-bottom-color: rgba(129, 140, 248, 0.14);
          box-shadow: 0 8px 32px rgba(0,0,0,0.45);
        }
        .light .nav-glass {
          background: rgba(250, 248, 245, 0.6);
          border-bottom-color: rgba(99, 102, 241, 0.1);
        }
        .light .nav-root.scrolled .nav-glass {
          background: rgba(250, 248, 245, 0.92);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .nav-accent-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(99,102,241,0.5) 25%,
            rgba(129,140,248,0.85) 50%,
            rgba(99,102,241,0.5) 75%,
            transparent 100%
          );
        }

        .nav-inner {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, #4338ca, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(99,102,241,0.45);
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        .nav-logo:hover .nav-logo-icon {
          box-shadow: 0 0 22px rgba(99,102,241,0.7);
          transform: rotate(-6deg) scale(1.05);
        }
        .nav-logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .light .nav-logo-text { color: #1e1b4b; }
        .nav-logo-text em { font-style: normal; color: #818cf8; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.1rem;
          flex: 1;
          justify-content: center;
        }

        .nav-link {
          position: relative;
          padding: 0.38rem 0.7rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(199, 210, 254, 0.55);
          text-decoration: none;
          border-radius: 8px;
          letter-spacing: 0.01em;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.09);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 50%; right: 50%;
          height: 1.5px;
          background: #818cf8;
          border-radius: 99px;
          transition: left 0.2s ease, right 0.2s ease;
        }
        .nav-link:hover::after { left: 10px; right: 10px; }
        .light .nav-link { color: rgba(67, 56, 202, 0.55); }
        .light .nav-link:hover { color: #4338ca; background: rgba(99,102,241,0.07); }
        .light .nav-link::after { background: #4f46e5; }

        .nav-sep {
          width: 1px; height: 18px;
          background: rgba(129,140,248,0.15);
          margin: 0 0.35rem;
          flex-shrink: 0;
        }
        .light .nav-sep { background: rgba(99,102,241,0.15); }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.38rem 0.9rem;
          background: linear-gradient(135deg, #4338ca, #6366f1);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.02em;
          box-shadow: 0 0 10px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .nav-cta:hover {
          background: linear-gradient(135deg, #4f46e5, #818cf8);
          box-shadow: 0 0 18px rgba(99,102,241,0.5);
          transform: translateY(-1px);
        }

        .nav-ghost {
          display: inline-flex;
          align-items: center;
          padding: 0.38rem 0.8rem;
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.18);
          color: #a5b4fc;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-ghost:hover {
          background: rgba(99,102,241,0.13);
          border-color: rgba(99,102,241,0.35);
          color: #c7d2fe;
        }
        .light .nav-ghost { color: #4f46e5; background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.2); }
        .light .nav-ghost:hover { background: rgba(99,102,241,0.1); color: #3730a3; }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.28rem 0.65rem 0.28rem 0.3rem;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.16);
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nav-user:hover { background: rgba(99,102,241,0.13); border-color: rgba(99,102,241,0.28); }
        .light .nav-user { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.15); }
        .nav-avatar {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4338ca, #818cf8);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .nav-username {
          font-size: 0.82rem; font-weight: 500; color: #a5b4fc;
          max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .light .nav-username { color: #4f46e5; }

        .nav-logout {
          display: inline-flex; align-items: center;
          padding: 0.36rem 0.7rem;
          background: transparent;
          border: 1px solid rgba(239,68,68,0.2);
          color: rgba(239,68,68,0.65);
          font-size: 0.82rem; font-weight: 500;
          border-radius: 8px; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          font-family: inherit;
        }
        .nav-logout:hover { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.4); color: #f87171; }

        .nav-toggle {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.16);
          color: #a5b4fc;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0; font-size: 0.9rem;
        }
        .nav-toggle:hover { background: rgba(99,102,241,0.13); border-color: rgba(99,102,241,0.3); }
        .light .nav-toggle { color: #4f46e5; background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.14); }

        .nav-ham {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.16);
          color: #a5b4fc;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-ham:hover { background: rgba(99,102,241,0.13); }
        .light .nav-ham { color: #4f46e5; }

        .mobile-drawer {
          position: fixed;
          top: 60px; left: 0; right: 0;
          background: rgba(2, 2, 9, 0.97);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          padding: 0.75rem 1.25rem 1.25rem;
          z-index: 49;
          animation: drawerIn 0.2s ease forwards;
        }
        .light .mobile-drawer { background: rgba(250,248,245,0.98); }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.7rem;
          color: rgba(199,210,254,0.6);
          font-size: 0.88rem; font-weight: 500;
          text-decoration: none; border-radius: 9px; transition: all 0.15s;
        }
        .mobile-link:hover { background: rgba(99,102,241,0.09); color: #c7d2fe; }
        .light .mobile-link { color: rgba(67,56,202,0.6); }
        .light .mobile-link:hover { color: #3730a3; background: rgba(99,102,241,0.06); }
        .mobile-sep { height: 1px; background: rgba(99,102,241,0.09); margin: 0.5rem 0; }

        @media (max-width: 768px) { .nav-desktop { display: none !important; } }
        @media (min-width: 769px) { .nav-mobile { display: none !important; } .mobile-drawer { display: none !important; } }
      `}</style>

      <nav className={`nav-root${scrolled ? " scrolled" : ""}${isDark ? "" : " light"}`}>
        <div className="nav-glass" />
        <div className="nav-accent-line" />

        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo-badge.png"
              alt="DevArena Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold tracking-tight">
              Dev<span className="text-blue-500">Arena</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links nav-desktop">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/create-question" className="nav-link">Create Question</Link>
            <Link to="/show-all-questions" className="nav-link">Questions</Link>
            <Link to="/create-contest" className="nav-link">Create Contest</Link>
            <Link to="/my-contests" className="nav-link">My Contests</Link>
          </div>

          {/* Desktop right side */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
            <div className="nav-sep" />
            <button className="nav-toggle" onClick={toggleTheme} title="Toggle theme">
              {isDark ? "☀️" : "🌙"}
            </button>
            <div className="nav-sep" />
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-user">
                  <div className="nav-avatar">{user?.displayName?.[0]?.toUpperCase() ?? "U"}</div>
                  <span className="nav-username">{user?.displayName}</span>
                </Link>
                <button className="nav-logout" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-ghost">Login</Link>
                <Link to="/signup" className="nav-cta">
                  <Zap size={12} strokeWidth={2.5} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="nav-mobile" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button className="nav-toggle" onClick={toggleTheme}>{isDark ? "☀️" : "🌙"}</button>
            <button className="nav-ham" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className={`mobile-drawer${isDark ? "" : " light"}`}>
          {[
            { label: "Home", to: "/" },
            { label: "Dashboard", to: "/dashboard" },
            { label: "Create Question", to: "/create-question" },
            { label: "All Questions", to: "/show-all-questions" },
            { label: "Create Contest", to: "/create-contest" },
            { label: "My Contests", to: "/my-contests" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="mobile-link" onClick={() => setIsOpen(false)}>
              {label}
              <ChevronRight size={13} opacity={0.35} />
            </Link>
          ))}
          <div className="mobile-sep" />
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setIsOpen(false)}>
                <span>👤 {user?.displayName}</span>
                <ChevronRight size={13} opacity={0.35} />
              </Link>
              <button
                className="nav-logout"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.3rem" }}
                onClick={() => { setIsOpen(false); logout() }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" }}>
              <Link to="/login" className="nav-ghost" style={{ justifyContent: "center" }} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/signup" className="nav-cta" style={{ justifyContent: "center" }} onClick={() => setIsOpen(false)}>
                <Zap size={12} /> Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar