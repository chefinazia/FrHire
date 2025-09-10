import { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../context/AuthContext'

// Lightweight ATS keywords (aligned with ResumeUpload but scoped here)
const KEYWORDS = {
  frontend: ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'next.js', 'angular', 'vue'],
  backend: ['node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'php', 'laravel', 'go'],
  database: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd'],
  datascience: ['pandas', 'numpy', 'tensorflow', 'pytorch', 'spark', 'scikit-learn'],
  testing: ['jest', 'cypress', 'selenium', 'pytest', 'junit'],
  soft: ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical']
}

const ResumeBuilder = ({ onExported }) => {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    skills: '', // comma separated
    experience: [
      { company: '', role: '', start: '', end: '', bullets: '' }
    ],
    education: [
      { school: '', degree: '', start: '', end: '' }
    ],
    projects: [
      { name: '', link: '', description: '' }
    ],
    certifications: '' // comma separated
  })

  const previewRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (section, idx, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === idx ? { ...item, [field]: value } : item)
    }))
  }

  const addItem = (section, template) => {
    setForm(prev => ({ ...prev, [section]: [...prev[section], template] }))
  }

  const removeItem = (section, idx) => {
    setForm(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }))
  }

  // Simple ATS guidance
  const atsHints = useMemo(() => {
    const text = (
      `${form.summary}\n${form.skills}\n` +
      form.experience.map(e => `${e.company} ${e.role} ${e.bullets}`).join('\n') + '\n' +
      form.projects.map(p => `${p.name} ${p.description}`).join('\n')
    ).toLowerCase()

    const found = {}
    const missing = []
    Object.entries(KEYWORDS).forEach(([cat, words]) => {
      found[cat] = words.filter(w => text.includes(w))
      if (found[cat].length === 0) missing.push(cat)
    })

    const hasContact = !!(form.email || form.phone)
    const hasExperience = form.experience.some(e => e.company || e.role)
    const hasEducation = form.education.some(e => e.school || e.degree)
    const hasSkills = (form.skills || '').trim().length > 0
    const hasProjects = form.projects.some(p => p.name || p.description)

    // Basic score: sections + keywords coverage
    const sectionsScore = [hasContact, hasExperience, hasEducation, hasSkills, hasProjects].filter(Boolean).length
    const keywordScore = Object.values(found).reduce((acc, arr) => acc + (arr.length > 0 ? 1 : 0), 0)
    const score = Math.round(((sectionsScore + keywordScore) / (5 + Object.keys(KEYWORDS).length)) * 100)

    const recommendations = []
    if (!hasContact) recommendations.push('Add email and phone in header.')
    if (!hasExperience) recommendations.push('Add at least one work experience with bullet points.')
    if (!hasEducation) recommendations.push('Add an education entry (degree, school, years).')
    if (!hasSkills) recommendations.push('List your skills as comma-separated keywords (e.g., React, Node.js, AWS).')
    if (!hasProjects) recommendations.push('Include 1-2 projects with impact and links (GitHub/Live).')

    const rating = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'
    const color = score >= 85 ? 'text-green-600' : score >= 70 ? 'text-blue-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'

    return { found, missing, score, rating, color, recommendations }
  }, [form])

  const exportToPdf = async () => {
    setIsExporting(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      const node = previewRef.current
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'pt', 'a4')

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Fit to page width and slice across multiple pages if needed
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${(form.fullName || 'resume').replace(/\s+/g, '_')}.pdf`)
      if (onExported) onExported()
    } catch (err) {
      console.warn('Failed to export PDF:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editor */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🧩 Build ATS-Friendly Resume</h3>
          <div className="flex items-center space-x-3">
            <div className={`text-sm font-semibold ${atsHints.color}`}>{atsHints.rating}</div>
            <div className="text-xs text-gray-500">Score: {atsHints.score}%</div>
            <button onClick={exportToPdf} disabled={isExporting} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="Full Name" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={e => handleChange('location', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm md:col-span-2" placeholder="LinkedIn" value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="GitHub" value={form.github} onChange={e => handleChange('github', e.target.value)} />
                <input className="border rounded-md px-3 py-2 text-sm" placeholder="Portfolio" value={form.portfolio} onChange={e => handleChange('portfolio', e.target.value)} />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Professional Summary</label>
              <textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="2-3 lines highlighting your impact, domain, and key strengths." value={form.summary} onChange={e => handleChange('summary', e.target.value)} />
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Skills (comma separated)</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="React, Node.js, AWS, PostgreSQL, Docker" value={form.skills} onChange={e => handleChange('skills', e.target.value)} />
            </div>

            {/* Experience */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-800">Work Experience</label>
                <button onClick={() => addItem('experience', { company: '', role: '', start: '', end: '', bullets: '' })} className="text-blue-600 text-sm font-medium">+ Add Experience</button>
              </div>
              <div className="space-y-4">
                {form.experience.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experience', idx, 'company', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Role / Title" value={exp.role} onChange={e => handleArrayChange('experience', idx, 'role', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Start (e.g., Jan 2023)" value={exp.start} onChange={e => handleArrayChange('experience', idx, 'start', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="End (e.g., Present)" value={exp.end} onChange={e => handleArrayChange('experience', idx, 'end', e.target.value)} />
                    </div>
                    <textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="3-4 bullets. Use metrics: Increased conversion by 25%, Reduced latency by 40%, etc." value={exp.bullets} onChange={e => handleArrayChange('experience', idx, 'bullets', e.target.value)} />
                    {form.experience.length > 1 && (
                      <div className="text-right">
                        <button onClick={() => removeItem('experience', idx)} className="text-red-600 text-sm font-medium">Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-800">Education</label>
                <button onClick={() => addItem('education', { school: '', degree: '', start: '', end: '' })} className="text-blue-600 text-sm font-medium">+ Add Education</button>
              </div>
              <div className="space-y-3">
                {form.education.map((ed, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="School / University" value={ed.school} onChange={e => handleArrayChange('education', idx, 'school', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Degree / Program" value={ed.degree} onChange={e => handleArrayChange('education', idx, 'degree', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Start" value={ed.start} onChange={e => handleArrayChange('education', idx, 'start', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="End" value={ed.end} onChange={e => handleArrayChange('education', idx, 'end', e.target.value)} />
                    </div>
                    {form.education.length > 1 && (
                      <div className="text-right">
                        <button onClick={() => removeItem('education', idx)} className="text-red-600 text-sm font-medium">Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-800">Key Projects</label>
                <button onClick={() => addItem('projects', { name: '', link: '', description: '' })} className="text-blue-600 text-sm font-medium">+ Add Project</button>
              </div>
              <div className="space-y-3">
                {form.projects.map((p, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Project Name" value={p.name} onChange={e => handleArrayChange('projects', idx, 'name', e.target.value)} />
                      <input className="border rounded-md px-3 py-2 text-sm" placeholder="Link (GitHub/Live)" value={p.link} onChange={e => handleArrayChange('projects', idx, 'link', e.target.value)} />
                    </div>
                    <textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Short description with outcomes & tech used." value={p.description} onChange={e => handleArrayChange('projects', idx, 'description', e.target.value)} />
                    {form.projects.length > 1 && (
                      <div className="text-right">
                        <button onClick={() => removeItem('projects', idx)} className="text-red-600 text-sm font-medium">Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Certifications (comma separated)</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="AWS Certified, Google Cloud, Scrum Master" value={form.certifications} onChange={e => handleChange('certifications', e.target.value)} />
            </div>
          </div>

          {/* Right: Professional Live Preview (print-optimized) */}
          <div>
            <div ref={previewRef} className="bg-white border shadow-sm" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}>
              {/* Header Section */}
              <div className="px-8 pt-8 pb-4 border-b-2 border-gray-300">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.fullName || 'Your Name'}</h1>
                <div className="text-xs text-gray-700 mb-2">
                  {form.location && <span>{form.location}</span>}
                  {form.email && <span> • {form.email}</span>}
                  {form.phone && <span> • {form.phone}</span>}
                </div>
                <div className="text-xs text-gray-600">
                  {form.linkedin && <span>LinkedIn: {form.linkedin}</span>}
                  {form.github && <span> • GitHub: {form.github}</span>}
                  {form.portfolio && <span> • Portfolio: {form.portfolio}</span>}
                </div>
              </div>

              <div className="px-8 py-6">
                {/* Summary */}
                {form.summary && (
                  <section className="mb-6">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Professional Summary</h2>
                    <p className="text-xs text-gray-800 leading-relaxed">
                      {form.summary}
                    </p>
                  </section>
                )}

                {/* Skills */}
                {form.skills && (
                  <section className="mb-6">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Core Skills</h2>
                    <div className="text-xs text-gray-800">
                      {form.skills.split(',').map((s, i, arr) => (
                        <span key={i}>
                          {s.trim()}{i < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experience */}
                {form.experience.some(e => e.company || e.role || e.bullets) && (
                  <section className="mb-6">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Work Experience</h2>
                    <div className="space-y-4">
                      {form.experience.map((e, i) => (
                        (e.company || e.role || e.bullets) && (
                          <div key={i} className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-xs font-semibold text-gray-900">{e.role || 'Position'}</div>
                                <div className="text-xs text-gray-700">{e.company}</div>
                              </div>
                              <div className="text-xs text-gray-600 text-right">
                                {e.start || ''}{(e.start || e.end) ? ' - ' : ''}{e.end || ''}
                              </div>
                            </div>
                            {e.bullets && (
                              <ul className="mt-2 list-disc list-inside text-xs text-gray-800 space-y-1 ml-3">
                                {e.bullets.split('\n').map((b, bi) => b.trim() && <li key={bi}>{b.trim()}</li>)}
                              </ul>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {form.projects.some(p => p.name || p.description) && (
                  <section className="mb-6">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Key Projects</h2>
                    <div className="space-y-3">
                      {form.projects.map((p, i) => (
                        (p.name || p.description) && (
                          <div key={i} className="text-xs text-gray-800">
                            <div className="font-semibold mb-1">
                              {p.name} {p.link && <span className="text-blue-700">({p.link})</span>}
                            </div>
                            <div className="mt-1">{p.description}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {form.education.some(e => e.school || e.degree) && (
                  <section className="mb-6">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Education</h2>
                    <div className="space-y-2">
                      {form.education.map((e, i) => (
                        (e.school || e.degree) && (
                          <div key={i} className="text-xs text-gray-800">
                            <div className="font-semibold">{e.degree}</div>
                            <div>{e.school}</div>
                            <div className="text-gray-600">{e.start || ''}{(e.start || e.end) ? ' - ' : ''}{e.end || ''}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {form.certifications && (
                  <section>
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Certifications</h2>
                    <div className="text-xs text-gray-800">
                      {form.certifications.split(',').map((c, i, arr) => (
                        <span key={i}>
                          {c.trim()}{i < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Guidance */}
            <div className="mt-4 bg-gray-50 border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">ATS Guidance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Missing Categories</div>
                  {atsHints.missing.length ? (
                    <div className="flex flex-wrap gap-1">
                      {atsHints.missing.map((c) => (
                        <span key={c} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs capitalize">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-green-700">Great coverage across categories!</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Found Keywords</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(atsHints.found).flatMap(([cat, arr]) => arr.slice(0, 2).map(k => (
                      <span key={`${cat}-${k}`} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{k}</span>
                    )))}
                  </div>
                </div>
              </div>
              {atsHints.recommendations.length > 0 && (
                <ul className="mt-3 list-disc list-inside text-xs text-gray-700 space-y-1">
                  {atsHints.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ResumeBuilder.propTypes = {
  onExported: PropTypes.func
}

export default ResumeBuilder


