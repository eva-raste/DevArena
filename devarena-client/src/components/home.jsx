"use client"
import { Link } from "react-router-dom"
import { FileQuestion, Trophy, Code2, ArrowRight, Zap, Users } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import ShaderBackground from "./ui/shader-background"

function Home() {
  const headingRef = useRef(null)
  const gradientTextRef = useRef(null)

  useEffect(() => {
    if (!headingRef.current || !gradientTextRef.current) return
    const chars = headingRef.current.querySelectorAll('.char')
    gsap.fromTo(chars,
      { opacity: 0, y: 50, rotationX: -90 },
      { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.2 }
    )
    gsap.to(gradientTextRef.current, {
      textShadow: '0 0 60px rgba(96,165,250,0.9), 0 0 30px rgba(96,165,250,0.7)',
      duration: 2, repeat: -1, yoyo: true, ease: 'power1.inOut'
    })
  }, [])

  return (
    <>
      <ShaderBackground />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'rgba(2,6,23,0.45)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <div style={{ paddingTop: 88, paddingLeft: 16, paddingRight: 16 }}>

          {/* Heading */}
          <div style={{ maxWidth: 1152, margin: '0 auto 48px', textAlign: 'center' }}>
            <h1
              ref={headingRef}
              style={{
                fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 900,
                marginBottom: 16, letterSpacing: '-0.025em',
                perspective: '1000px', transformStyle: 'preserve-3d',
                color: '#ffffff',
                textShadow: '0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.3)',
              }}
            >
              <span style={{ display: 'inline-block' }}>
                {'Build. Compete. '.split('').map((ch, i) => (
                  <span key={i} className="char" style={{ display: 'inline-block' }}>
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </span>
              <span
                ref={gradientTextRef}
                style={{
                  display: 'inline-block', fontWeight: 900,
                  color: '#60a5fa',
                  textShadow: '0 0 40px rgba(96,165,250,0.8), 0 0 20px rgba(96,165,250,0.6)',
                }}
              >
                {'Excel.'.split('').map((ch, i) => (
                  <span key={i} className="char" style={{ display: 'inline-block' }}>{ch}</span>
                ))}
              </span>
            </h1>
          </div>

          {/* Code Editor */}
          <div style={{ position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 64 }}>
            {['left','right'].map(side => (
              <div key={side} style={{
                position: 'absolute', [side]: 0, top: '50%',
                height: '120%', width: 600, borderRadius: '50%',
                filter: 'blur(180px)', pointerEvents: 'none',
                background: `radial-gradient(ellipse at ${side}, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0.4) 40%, transparent 70%)`,
                transform: `translateY(-50%) translateX(${side === 'left' ? '-30%' : '30%'})`,
              }} />
            ))}

            <div style={{ width: 1000, maxWidth: '85vw', position: 'relative', zIndex: 2 }}>
              <div style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(51,65,85,0.8)', background: 'rgba(10,15,30,0.92)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(51,65,85,0.7)', background: 'rgba(20,30,50,0.95)', padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['rgba(239,68,68,0.9)','rgba(234,179,8,0.9)','rgba(34,197,94,0.9)'].map((bg,i) => (
                        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500 }}>solution.cpp</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <Code2 style={{ width: 16, height: 16 }} /><span>C++17</span>
                  </div>
                </div>
                <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.75 }}>
                  {[
                    [['#64748b','#include '],['#34d399','<iostream>']],
                    [['#64748b','#include '],['#34d399','<vector>']],
                    [['#64748b','using namespace '],['#60a5fa','std'],['#94a3b8',';']],
                    [],
                    [['#c084fc','class '],['#fde047','Solution '],['#94a3b8','{']],
                    [['#c084fc','public:',16]],
                    [['#60a5fa','vector',32],['#94a3b8','<'],['#60a5fa','int'],['#94a3b8','> '],['#fde047','twoSum'],['#94a3b8','('],['#60a5fa','vector'],['#94a3b8','<'],['#60a5fa','int'],['#94a3b8','> '],['#fdba74','nums'],['#94a3b8',', '],['#60a5fa','int '],['#fdba74','target'],['#94a3b8',') {']],
                    [['#60a5fa','unordered_map',48],['#94a3b8','<'],['#60a5fa','int'],['#94a3b8',', '],['#60a5fa','int'],['#94a3b8','> '],['#fdba74','seen'],['#94a3b8',';']],
                    [],
                    [['#c084fc','for ',48],['#94a3b8','('],['#60a5fa','int '],['#fdba74','i '],['#c084fc','= '],['#4ade80','0'],['#94a3b8','; '],['#fdba74','i '],['#c084fc','< '],['#fdba74','nums'],['#94a3b8','.'],['#fde047','size'],['#94a3b8','(); ++'],['#fdba74','i'],['#94a3b8',') {']],
                    [['#60a5fa','int ',64],['#fdba74','complement '],['#c084fc','= '],['#fdba74','target '],['#c084fc','- '],['#fdba74','nums'],['#94a3b8','['],['#fdba74','i'],['#94a3b8','];']],
                    [['#c084fc','if ',64],['#94a3b8','('],['#fdba74','seen'],['#94a3b8','.'],['#fde047','count'],['#94a3b8','('],['#fdba74','complement'],['#94a3b8',')) '],['#c084fc','return '],['#94a3b8','{'],['#fdba74','seen'],['#94a3b8','['],['#fdba74','complement'],['#94a3b8','], '],['#fdba74','i'],['#94a3b8','};']],
                    [['#fdba74','seen',64],['#94a3b8','['],['#fdba74','nums'],['#94a3b8','['],['#fdba74','i'],['#94a3b8','] = '],['#fdba74','i'],['#94a3b8',';']],
                    [['#94a3b8','}',48]],
                    [['#c084fc','return ',48],['#94a3b8','{}; ']],
                    [['#94a3b8','}',32]],
                    [['#94a3b8','};']],
                  ].map((tokens, i) => (
                    <div key={i} style={{ display: 'flex', marginBottom: 2 }}>
                      <span style={{ marginRight: 24, userSelect: 'none', color: '#475569', width: 32, textAlign: 'right', flexShrink: 0 }}>{i+1}</span>
                      <span>{tokens.map(([color,text,pl], j) => (
                        <span key={j} style={{ color, paddingLeft: pl ? `${pl}px` : undefined }}>{text}</span>
                      ))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Below Editor */}
          <div style={{ maxWidth: 1152, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(1.1rem,2vw,1.25rem)', margin: '0 auto 48px', maxWidth: 700, color: '#cbd5e1' }}>
              Create coding challenges, host contests, and sharpen your programming skills in a competitive environment.
            </p>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24, marginBottom: 64 }}>
              {[
                { Icon: FileQuestion, title: 'Create Questions', desc: 'Design challenging problems to test programming skills', ic: '#60a5fa', ib: 'rgba(59,130,246,0.2)' },
                { Icon: Trophy,       title: 'Host Contests',    desc: 'Organize competitive coding events and track performance', ic: '#fbbf24', ib: 'rgba(251,191,36,0.2)' },
                { Icon: Code2,        title: 'Browse Questions', desc: 'Explore a vast collection of coding challenges', ic: '#22d3ee', ib: 'rgba(34,211,238,0.2)' },
              ].map(({ Icon, title, desc, ic, ib }, i) => (
                <div key={i} style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(71,85,105,0.6)', borderRadius: 16, padding: 32, backdropFilter: 'blur(16px)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: ib }}>
                    <Icon style={{ width: 28, height: 28, color: ic }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12, color: '#ffffff' }}>{title}</h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Let's Start CTA */}
            <div style={{ marginBottom: 80 }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '18px 48px', borderRadius: 14,
                  fontSize: '1.2rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#fff', textDecoration: 'none',
                  boxShadow: '0 4px 30px rgba(37,99,235,0.5), 0 0 60px rgba(124,58,237,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(37,99,235,0.6), 0 0 80px rgba(124,58,237,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 30px rgba(37,99,235,0.5), 0 0 60px rgba(124,58,237,0.3)'
                }}
              >
                Let's Start <ArrowRight style={{ width: 22, height: 22 }} />
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, maxWidth: 700, margin: '0 auto 80px' }}>
              {[
                { Icon: Zap,    value: '500+', label: 'Questions', color: '#60a5fa' },
                { Icon: Trophy, value: '100+', label: 'Contests',  color: '#fbbf24' },
                { Icon: Users,  value: '1K+',  label: 'Users',     color: '#22d3ee' },
              ].map(({ Icon, value, label, color }, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 12, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(71,85,105,0.6)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Icon style={{ width: 20, height: 20, color }} />
                    <span style={{ fontSize: '2.25rem', fontWeight: 700, color }}>{value}</span>
                  </div>
                  <div style={{ fontWeight: 500, color: '#94a3b8' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home