import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import PropTypes from 'prop-types'

const SmartResumeForm = ({ atsAnalysis, atsScore = null, onFormSubmit, onFormUpdate, extractedData, forceShow = false }) => {
  const [formData, setFormData] = useState({
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    summary: ''
  })
  const [needsImprovement, setNeedsImprovement] = useState({})
  const [isFormVisible, setIsFormVisible] = useState(false)
  const isUpdatingRef = useRef(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isExporting, setIsExporting] = useState(false)

  const analyzeNeedsImprovement = useCallback(() => {
    if (!atsAnalysis || !atsAnalysis.analysis) return

    // Show all sections by default for user review and improvement
    const needs = {
      contactInfo: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      summary: true,
      metrics: true
    }
    setNeedsImprovement(needs)

    // Always show form for user to review and improve
    setIsFormVisible(true)
  }, [atsAnalysis])

  const extractResumeData = useCallback(() => {
    console.log('extractResumeData called:', {
      extractedData: !!extractedData,
      extractedDataKeys: extractedData ? Object.keys(extractedData) : [],
      atsAnalysis: !!atsAnalysis
    })

    // Use extracted data if provided, otherwise fall back to analysis-based extraction
    if (extractedData) {
      console.log('SmartResumeForm received extractedData:', extractedData)
      console.log('Contact info from extractedData:', extractedData.contactInfo)
      console.log('Skills from extractedData:', extractedData.skills)
      console.log('Summary from extractedData:', extractedData.summary)

      // Check if extractedData has meaningful content - more lenient check
      const hasContent = extractedData.contactInfo?.name ||
        extractedData.skills?.length > 0 ||
        extractedData.summary ||
        extractedData.experience?.length > 0 ||
        extractedData.education?.length > 0 ||
        extractedData.projects?.length > 0 ||
        extractedData.certifications?.length > 0

      console.log('extractedData has meaningful content:', hasContent)
      console.log('Content check details:', {
        contactName: extractedData.contactInfo?.name,
        skillsLength: extractedData.skills?.length,
        summary: extractedData.summary,
        experienceLength: extractedData.experience?.length,
        educationLength: extractedData.education?.length,
        projectsLength: extractedData.projects?.length,
        certificationsLength: extractedData.certifications?.length
      })

      // Always use the extracted data, even if it seems empty - let the user see what was parsed
      console.log('Using extracted data directly:', extractedData)

      // Ensure summary is always a string
      const safeData = {
        ...extractedData,
        summary: typeof extractedData.summary === 'string' ? extractedData.summary : '',
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
        education: Array.isArray(extractedData.education) ? extractedData.education : [],
        projects: Array.isArray(extractedData.projects) ? extractedData.projects : [],
        certifications: Array.isArray(extractedData.certifications) ? extractedData.certifications : [],
        contactInfo: extractedData.contactInfo || {
          name: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          portfolio: '',
          twitter: ''
        }
      }

      // Only use fallback if absolutely no data was extracted
      if (!hasContent) {
        console.warn('No meaningful content found, adding minimal fallback data')
        safeData.summary = safeData.summary || 'Professional with technical expertise'
        if (safeData.skills.length === 0) {
          safeData.skills = ['JavaScript', 'React', 'Node.js']
        }
        if (safeData.experience.length === 0) {
          safeData.experience = [{ title: 'Software Developer', company: 'Tech Company', duration: '2020 - Present', description: 'Developed and maintained web applications' }]
        }
        if (safeData.education.length === 0) {
          safeData.education = [{ degree: 'Bachelor of Science in Computer Science', institution: 'University', year: '2020' }]
        }
      }

      console.log('Setting form data:', safeData)
      setFormData(safeData)
      setIsFormVisible(true) // Show form when data is extracted
      return
    }

    if (!atsAnalysis) return

    const dataToUse = {
      contactInfo: {
        name: atsAnalysis.foundKeywords?.soft?.includes('john') ? 'John Smith' : '',
        email: atsAnalysis.foundKeywords?.soft?.includes('email') ? 'john@example.com' : '',
        phone: atsAnalysis.foundKeywords?.soft?.includes('phone') ? '(555) 123-4567' : '',
        location: atsAnalysis.foundKeywords?.soft?.includes('san francisco') ? 'San Francisco, CA' : ''
      },
      experience: atsAnalysis.analysis.hasExperience ? [
        {
          title: 'Software Developer',
          company: 'Tech Corp',
          duration: '2022-2024',
          description: 'Developed web applications using React and Node.js'
        }
      ] : [],
      education: atsAnalysis.analysis.hasEducation ? [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          year: '2018-2022'
        }
      ] : [],
      skills: [
        ...(atsAnalysis.foundKeywords?.frontend || []),
        ...(atsAnalysis.foundKeywords?.backend || []),
        ...(atsAnalysis.foundKeywords?.database || []),
        ...(atsAnalysis.foundKeywords?.cloud || [])
      ].slice(0, 10), // Limit to 10 skills
      projects: [],
      certifications: [],
      summary: 'Experienced software developer with expertise in full-stack development'
    }

    // Set the extracted data
    setFormData(dataToUse)
    setIsFormVisible(true) // Show form when data is extracted from analysis
  }, [atsAnalysis, extractedData])

  // Reset initialization ref when extractedData changes (removed to prevent issues)

  // Call analysis and extraction when data is available
  useEffect(() => {
    console.log('useEffect triggered:', { atsAnalysis: !!atsAnalysis, extractedData: !!extractedData })
    if (atsAnalysis) {
      console.log('Calling analyzeNeedsImprovement and extractResumeData')
      analyzeNeedsImprovement()
      extractResumeData()
    }
  }, [atsAnalysis, extractedData])

  // Ensure form is visible when we have data
  useEffect(() => {
    if (formData && (formData.contactInfo?.name || formData.summary || formData.skills?.length > 0)) {
      console.log('Setting form visible due to formData:', formData)
      setIsFormVisible(true)
    }
  }, [formData])

  // Force show form when we have extractedData or atsAnalysis
  useEffect(() => {
    if (extractedData || atsAnalysis) {
      console.log('Force showing form due to data availability:', { extractedData: !!extractedData, atsAnalysis: !!atsAnalysis })
      setIsFormVisible(true)
    }
  }, [extractedData, atsAnalysis])

  // Handle forceShow prop to reset form visibility
  useEffect(() => {
    if (forceShow) {
      setIsFormVisible(true)
    }
  }, [forceShow])

  // Debug form data
  useEffect(() => {
    console.log('SmartResumeForm formData updated:', formData)
    console.log('Experience array:', formData.experience)
    console.log('Is experience array?', Array.isArray(formData.experience))
    console.log('Experience length:', formData.experience?.length)
    console.log('needsImprovement:', needsImprovement)
    console.log('needsImprovement.experience:', needsImprovement.experience)
  }, [formData, needsImprovement])

  // ATS Validation Functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''))
  }

  const validateATSContent = (content, type) => {
    const errors = []

    switch (type) {
      case 'email':
        if (!validateEmail(content)) {
          errors.push('Invalid email format')
        }
        break
      case 'phone':
        if (!validatePhone(content)) {
          errors.push('Invalid phone format. Use international format: +1234567890')
        }
        break
      case 'summary':
        if (content.length < 50) {
          errors.push('Summary too short. Aim for 50-200 words')
        }
        if (content.length > 200) {
          errors.push('Summary too long. Keep under 200 words')
        }
        if (!content.match(/\b(experience|expertise|skilled|proficient|developed|built|created|managed|led|achieved|increased|improved|reduced|optimized)\b/i)) {
          errors.push('Include action verbs and quantifiable achievements')
        }
        break
      case 'experience':
        if (content.length < 20) {
          errors.push('Description too short. Include specific achievements and metrics')
        }
        if (!content.match(/\b(developed|built|created|managed|led|achieved|increased|improved|reduced|optimized|implemented|designed|architected)\b/i)) {
          errors.push('Use strong action verbs')
        }
        if (!content.match(/\b(\d+%|\d+x|\$\d+|\d+ users|\d+ projects|\d+ years)\b/)) {
          errors.push('Include quantifiable metrics and numbers')
        }
        break
      case 'skills':
        if (content.length < 3) {
          errors.push('Add more technical skills')
        }
        break
    }

    return errors
  }

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev }

      // Ensure the section exists
      if (!newData[section]) {
        newData[section] = section === 'skills' ? [] : section === 'summary' ? '' : {}
      }

      if (index !== null) {
        // Handle array items (experience, education, projects, certifications)
        if (!Array.isArray(newData[section])) {
          newData[section] = []
        }
        if (!newData[section][index]) {
          newData[section][index] = {}
        }
        newData[section][index] = { ...newData[section][index], [field]: value }

        // Validate experience descriptions
        if (section === 'experience' && field === 'description') {
          const errors = validateATSContent(value, 'experience')
          setValidationErrors(prev => ({
            ...prev,
            [`${section}_${index}_${field}`]: errors
          }))
        }
      } else if (section === 'skills') {
        // Handle skills as comma-separated string
        newData[section] = value.split(',').map(skill => skill.trim()).filter(skill => skill)

        // Validate skills
        const errors = validateATSContent(value, 'skills')
        setValidationErrors(prev => ({
          ...prev,
          [`${section}`]: errors
        }))
      } else if (section === 'summary') {
        // Handle summary as direct string
        newData[section] = value

        // Validate summary
        const errors = validateATSContent(value, 'summary')
        setValidationErrors(prev => ({
          ...prev,
          [`${section}`]: errors
        }))
      } else {
        // Handle nested objects (contactInfo)
        if (typeof newData[section] !== 'object' || newData[section] === null) {
          newData[section] = {}
        }
        newData[section] = { ...newData[section], [field]: value }

        // Validate contact info
        if (section === 'contactInfo') {
          const errors = validateATSContent(value, field)
          setValidationErrors(prev => ({
            ...prev,
            [`${section}_${field}`]: errors
          }))
        }
      }
      return newData
    })
  }

  // Update parent component when form data changes
  useEffect(() => {
    if (onFormUpdate && formData) {
      // Only prevent rapid updates, not the initial one
      if (isUpdatingRef.current) {
        return
      }
      isUpdatingRef.current = true
      onFormUpdate(formData)
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 200)
    }
  }, [formData, onFormUpdate])

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
    }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }))
  }

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: '', url: '' }]
    }))
  }

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', date: '' }]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onFormSubmit) {
      onFormSubmit(formData)
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Import PDFKit utility
      const { createResumePDF } = await import('../utils/pdfKitUtils')
      // Create PDF using PDFKit
      const pdfBlob = await createResumePDF(formData)

      // Verify it's a valid PDF blob
      if (pdfBlob.type !== 'application/pdf') {
        throw new Error('Generated blob is not a PDF file')
      }

      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'improved-resume.pdf'
      link.type = 'application/pdf'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)


    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('PDF generation failed: ' + error.message + '. Falling back to text download.')
      // Fallback to simple text download
      const textContent = `
RESUME

${formData.contactInfo?.name || ''}
${formData.contactInfo?.email || ''} | ${formData.contactInfo?.phone || ''} | ${formData.contactInfo?.location || ''}
${formData.contactInfo?.linkedin ? `LinkedIn: ${formData.contactInfo.linkedin}` : ''}
${formData.contactInfo?.github ? `GitHub: ${formData.contactInfo.github}` : ''}
${formData.contactInfo?.portfolio ? `Portfolio: ${formData.contactInfo.portfolio}` : ''}
${formData.contactInfo?.twitter ? `Twitter: ${formData.contactInfo.twitter}` : ''}

PROFESSIONAL SUMMARY
${formData.summary || ''}

TECHNICAL SKILLS
${Array.isArray(formData.skills) ? formData.skills.join(' • ') : ''}

PROFESSIONAL EXPERIENCE
${Array.isArray(formData.experience) ? formData.experience.map(exp =>
        `${exp.title || ''} | ${exp.company || ''} | ${exp.duration || ''}\n${exp.description || ''}`
      ).join('\n\n') : ''}

EDUCATION
${Array.isArray(formData.education) ? formData.education.map(edu =>
        `${edu.degree || ''} | ${edu.institution || ''} | ${edu.year || ''}`
      ).join('\n') : ''}

PROJECTS
${Array.isArray(formData.projects) ? formData.projects.map(proj =>
        `${proj.title || ''}\n${proj.description || ''}\nTechnologies: ${proj.technologies || ''}`
      ).join('\n\n') : ''}

CERTIFICATIONS
${Array.isArray(formData.certifications) ? formData.certifications.map(cert =>
        `${cert.name || ''} | ${cert.issuer || ''} | ${cert.date || ''}`
      ).join('\n') : ''}
      `

      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'resume.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  // Debug logging
  console.log('SmartResumeForm Debug:', {
    isFormVisible,
    hasExtractedData: !!extractedData,
    hasAtsAnalysis: !!atsAnalysis,
    formDataKeys: Object.keys(formData),
    contactInfo: formData.contactInfo,
    summary: formData.summary,
    skills: formData.skills,
    experience: formData.experience,
    education: formData.education,
    needsImprovement: needsImprovement
  })

  if (!isFormVisible) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-yellow-800 mb-2">Form Not Visible</h3>
        <p className="text-yellow-700 mb-4">
          Debug: isFormVisible = {isFormVisible.toString()}
        </p>
        <p className="text-yellow-700 mb-4">
          Has extractedData: {extractedData ? 'Yes' : 'No'}
        </p>
        <p className="text-yellow-700 mb-4">
          Has atsAnalysis: {atsAnalysis ? 'Yes' : 'No'}
        </p>
        <p className="text-yellow-700 mb-4">
          FormData keys: {Object.keys(formData).join(', ')}
        </p>
        <p className="text-yellow-700 mb-4">
          Contact name: {formData.contactInfo?.name || 'None'}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => setIsFormVisible(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 mr-2"
          >
            Force Show Form
          </button>
          <button
            onClick={() => {
              setFormData({
                contactInfo: {
                  name: 'Test User',
                  email: 'test@example.com',
                  phone: '123-456-7890',
                  location: 'Test City',
                  linkedin: '',
                  github: '',
                  portfolio: '',
                  twitter: ''
                },
                summary: 'Test summary',
                skills: ['JavaScript', 'React', 'Node.js'],
                experience: [{ title: 'Developer', company: 'Test Corp', duration: '2020-2024', description: 'Test description' }],
                education: [{ degree: 'BS Computer Science', institution: 'Test University', year: '2020' }],
                projects: [],
                certifications: []
              })
              setIsFormVisible(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Load Test Data & Show Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200 p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <svg className="w-[150px] h-[300px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">Smart Resume Builder</h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered resume optimization for better ATS compatibility. Edit your information below to create a professional, ATS-friendly resume.
        </p>
      </div>

      {/* Export Button - Prominent */}
      <div className="flex justify-center mb-8">
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-[300px] w-[150px]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <svg className="w-[150px] h-[300px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>📄 Export Resume as PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Resume Analyzed</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Review & Edit</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium text-gray-500">Export PDF</span>
          </div>
        </div>
      </div>

      <div id="resume-content" className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Contact Information */}
          {needsImprovement.contactInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-8 rounded-r-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-[150px] h-[300px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Contact Information</h4>
                  <p className="text-gray-600">Your basic contact details for ATS optimization</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg className="w-[150px] h-[300px] text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 ATS Optimization Tips</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a professional email address (avoid nicknames)</li>
                      <li>• Include full phone number with country code</li>
                      <li>• Use standard location format: City, State/Country</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={formData.contactInfo?.name || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm ${validationErrors.contactInfo_email ? 'border-red-500' : 'border-gray-200'
                      }`}
                    placeholder="john.doe@email.com"
                  />
                  {validationErrors.contactInfo_email && (
                    <div className="text-red-500 text-sm flex items-center">
                      <svg className="w-[150px] h-[300px] mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.contactInfo_email.map((error, idx) => (
                        <span key={idx}>{error}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm ${validationErrors.contactInfo_phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {validationErrors.contactInfo_phone && (
                    <div className="text-red-500 text-sm flex items-center">
                      <svg className="w-[150px] h-[300px] mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.contactInfo_phone.map((error, idx) => (
                        <span key={idx}>{error}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.contactInfo?.location || ''}
                    onChange={(e) => handleInputChange('contactInfo', 'location', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              {/* Social Profiles Section */}
              <div className="mt-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  Social Profiles (Optional)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={formData.contactInfo?.linkedin || ''}
                      onChange={(e) => handleInputChange('contactInfo', 'linkedin', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={formData.contactInfo?.github || ''}
                      onChange={(e) => handleInputChange('contactInfo', 'github', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 17h-2v-7h2v7zm-1-8.484c-.61 0-1.1-.49-1.1-1.1s.49-1.1 1.1-1.1 1.1.49 1.1 1.1-.49 1.1-1.1 1.1zm9 8.484h-2v-3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V17h-2v-7h2v1.5c.61-.83 1.5-1.5 2.5-1.5 1.66 0 3 1.34 3 3V17z" />
                      </svg>
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={formData.contactInfo?.portfolio || ''}
                      onChange={(e) => handleInputChange('contactInfo', 'portfolio', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      value={formData.contactInfo?.twitter || ''}
                      onChange={(e) => handleInputChange('contactInfo', 'twitter', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Summary */}
          {needsImprovement.summary && (
            <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <span className="mr-2">📝</span>
                Professional Summary (Recommended)
              </h4>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 ATS Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 50-200 words with action verbs (developed, built, created, managed)</li>
                  <li>• Include quantifiable achievements (increased by 25%, managed 10+ projects)</li>
                  <li>• Mention years of experience and key technologies</li>
                  <li>• Use industry-specific keywords from job descriptions</li>
                </ul>
              </div>
              <textarea
                value={formData.summary || ''}
                onChange={(e) => handleInputChange('summary', 'summary', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.summary ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Experienced Full Stack Developer with 6+ years of expertise in MERN stack applications. Built and scaled web applications serving 10,000+ users, increased system performance by 40%, and led cross-functional teams of 5+ developers. Proficient in Node.js, React.js, AWS, Docker, and CI/CD pipelines."
              />
              {validationErrors.summary && (
                <div className="mt-2 text-xs text-red-600">
                  {validationErrors.summary.map((error, idx) => (
                    <div key={idx}>⚠️ {error}</div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Word count: {typeof formData.summary === 'string' && formData.summary ? formData.summary.split(' ').filter(word => word.length > 0).length : 0} words
              </div>
            </div>
          )}

          {/* Skills Section */}
          {needsImprovement.skills && (
            <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Technical Skills (Needs Enhancement)
              </h4>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 ATS Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• List 15-25 relevant technical skills</li>
                  <li>• Include programming languages, frameworks, tools, databases</li>
                  <li>• Use exact keywords from job descriptions</li>
                  <li>• Group by category: Languages, Frameworks, Tools, Databases</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <textarea
                  value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                  onChange={(e) => {
                    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
                    setFormData(prev => ({ ...prev, skills: skillsArray }));
                  }}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.skills ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="JavaScript, React.js, Node.js, TypeScript, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git, CI/CD, Express.js, Nest.js, Jest, Agile, Jira, DevOps, SAP UI5, SAP Fiori, RabbitMQ, Redis, MySQL"
                />
                {validationErrors.skills && (
                  <div className="mt-1 text-xs text-red-600">
                    {validationErrors.skills.map((error, idx) => (
                      <div key={idx}>⚠️ {error}</div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Skills count: {Array.isArray(formData.skills) ? formData.skills.length : 0} skills
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {needsImprovement.experience && (
            <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">DEBUG: Experience section is rendering</p>
              <p className="text-xs text-yellow-700">Experience data: {JSON.stringify(formData.experience)}</p>
            </div>
          )}
          {needsImprovement.experience && (
            <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">💼</span>
                Work Experience (Needs Action Verbs & Metrics)
              </h4>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 ATS Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Start each bullet point with strong action verbs (developed, built, created, managed, led)</li>
                  <li>• Include quantifiable metrics (increased by 25%, managed 10+ projects, served 5,000+ users)</li>
                  <li>• Use present tense for current role, past tense for previous roles</li>
                  <li>• Keep descriptions 1-3 lines each</li>
                </ul>
              </div>
              {Array.isArray(formData.experience) ? formData.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleInputChange('experience', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Software Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tech Corp"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleInputChange('experience', 'duration', e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2022-2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Use action verbs & include metrics)
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors[`experience_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Developed and deployed 3 web applications using React and Node.js, resulting in 40% increase in user engagement..."
                    />
                    {validationErrors[`experience_${index}_description`] && (
                      <div className="mt-1 text-xs text-red-600">
                        {validationErrors[`experience_${index}_description`].map((error, idx) => (
                          <div key={idx}>⚠️ {error}</div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Use action verbs like &quot;developed&quot;, &quot;implemented&quot;, &quot;achieved&quot; and include numbers/metrics
                    </p>
                  </div>
                </div>
              )) : null}
              <button
                type="button"
                onClick={addExperience}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Another Experience
              </button>
            </div>
          )}

          {/* Education Section */}
          {needsImprovement.education && (
            <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">🎓</span>
                Education (Missing)
              </h4>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="University of Technology"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', 'year', e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2018-2022"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                + Add Another Education
              </button>
            </div>
          )}

          {/* Projects Section */}
          {needsImprovement.projects && (
            <div className="border-l-4 border-indigo-400 pl-4 bg-indigo-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                <span className="mr-2">🚀</span>
                Projects (Recommended)
              </h4>
              {formData.projects.map((project, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleInputChange('projects', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E-commerce Web Application"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Built a full-stack e-commerce platform with user authentication and payment processing..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL (Optional)</label>
                    <input
                      type="url"
                      value={project.url}
                      onChange={(e) => handleInputChange('projects', 'url', e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addProject}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + Add Project
              </button>
            </div>
          )}

          {/* Certifications Section */}
          {needsImprovement.certifications && (
            <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">🏆</span>
                Certifications (Recommended)
              </h4>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="AWS Certified Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCertification}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                + Add Certification
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 -m-8 p-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-[300px] w-[150px]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-[150px] h-[300px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>📄 Export PDF</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

SmartResumeForm.propTypes = {
  atsAnalysis: PropTypes.object,
  atsScore: PropTypes.object,
  onFormSubmit: PropTypes.func,
  onFormUpdate: PropTypes.func,
  extractedData: PropTypes.object,
  forceShow: PropTypes.bool
}

export default memo(SmartResumeForm)
