import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const ResumeUpload = ({ onResumeAnalyzed, onCoinsUpdate }) => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const fileInputRef = useRef(null)

  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedResume, setUploadedResume] = useState(null)
  const [atsAnalysis, setAtsAnalysis] = useState(null)

  // ATS Keywords that employers commonly search for
  const atsKeywords = {
    technical: [
      'javascript', 'react', 'node.js', 'python', 'java', 'sql', 'html', 'css',
      'mongodb', 'postgresql', 'git', 'aws', 'docker', 'kubernetes', 'typescript',
      'vue.js', 'angular', 'express', 'django', 'flask', 'spring', 'hibernate'
    ],
    soft: [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'project management', 'collaboration', 'adaptability', 'creativity', 'initiative'
    ],
    experience: [
      'experience', 'developed', 'implemented', 'managed', 'led', 'created',
      'designed', 'optimized', 'improved', 'achieved', 'delivered', 'coordinated'
    ],
    education: [
      'bachelor', 'master', 'degree', 'university', 'college', 'certification',
      'diploma', 'course', 'training', 'bootcamp'
    ]
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleResumeUpload(file)
      } else {
        alert('Please upload a PDF file only')
        event.target.value = ''
      }
    }
  }

  const handleResumeUpload = async (file) => {
    setIsUploading(true)
    setIsAnalyzing(true)

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create file URL for display
      const fileUrl = URL.createObjectURL(file)
      const resumeData = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toLocaleDateString(),
        url: fileUrl,
        type: file.type
      }

      setUploadedResume(resumeData)

      // Simulate text extraction and ATS analysis
      await analyzeResume()

      // Award coins for uploading resume
      const coinsEarned = 50
      onCoinsUpdate(coinsEarned)

      // Add success notification
      addNotification({
        type: 'resume_uploaded',
        title: 'Resume Uploaded Successfully!',
        message: `You earned ${coinsEarned} coins! Your resume has been analyzed for ATS compatibility.`,
        userId: user?.id
      })

      onResumeAnalyzed(resumeData, atsAnalysis)

    } catch (error) {
      console.error('Resume upload failed:', error)
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload resume. Please try again.',
        userId: user?.id
      })
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const analyzeResume = async () => {
    // Simulate text extraction from PDF
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock extracted text for demonstration
    const mockExtractedText = `
      John Smith
      Software Engineer
      Email: john@example.com
      Phone: (555) 123-4567
      
      EXPERIENCE
      Software Developer at Tech Corp (2022-2024)
      - Developed web applications using React and Node.js
      - Implemented responsive designs with HTML, CSS, and JavaScript
      - Collaborated with cross-functional teams
      - Managed database operations with MongoDB
      
      EDUCATION
      Bachelor of Science in Computer Science
      University of Technology (2018-2022)
      
      SKILLS
      Programming Languages: JavaScript, Python, Java
      Frameworks: React, Express, Django
      Databases: MongoDB, PostgreSQL
      Tools: Git, Docker, AWS
    `.toLowerCase()

    // Analyze ATS compatibility
    const analysis = performATSAnalysis(mockExtractedText)
    setAtsAnalysis(analysis)
    return analysis
  }

  const performATSAnalysis = (resumeText) => {
    const foundKeywords = {
      technical: [],
      soft: [],
      experience: [],
      education: []
    }

    let totalKeywords = 0
    let foundCount = 0

    // Check for keywords in each category
    Object.keys(atsKeywords).forEach(category => {
      atsKeywords[category].forEach(keyword => {
        totalKeywords++
        if (resumeText.includes(keyword.toLowerCase())) {
          foundKeywords[category].push(keyword)
          foundCount++
        }
      })
    })

    // Calculate ATS score
    const atsScore = Math.round((foundCount / totalKeywords) * 100)

    // Determine ATS rating
    let rating, color, recommendations
    if (atsScore >= 80) {
      rating = 'Excellent'
      color = 'text-green-600'
      recommendations = [
        'Your resume is highly ATS-friendly!',
        'Great keyword optimization',
        'Well-structured format'
      ]
    } else if (atsScore >= 60) {
      rating = 'Good'
      color = 'text-blue-600'
      recommendations = [
        'Add more industry-specific keywords',
        'Include more quantifiable achievements',
        'Consider adding technical certifications'
      ]
    } else if (atsScore >= 40) {
      rating = 'Fair'
      color = 'text-yellow-600'
      recommendations = [
        'Increase keyword density for your field',
        'Add more technical skills',
        'Include measurable accomplishments',
        'Use standard section headings'
      ]
    } else {
      rating = 'Needs Improvement'
      color = 'text-red-600'
      recommendations = [
        'Add relevant technical keywords',
        'Include industry-specific terms',
        'Use a more standard resume format',
        'Add education and experience sections',
        'Include measurable achievements'
      ]
    }

    return {
      score: atsScore,
      rating,
      color,
      foundKeywords,
      totalKeywords: foundCount,
      recommendations,
      analysis: {
        hasContactInfo: resumeText.includes('email') || resumeText.includes('phone'),
        hasExperience: resumeText.includes('experience') || resumeText.includes('work'),
        hasEducation: resumeText.includes('education') || resumeText.includes('degree'),
        hasSkills: resumeText.includes('skills') || resumeText.includes('programming')
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleResumeUpload(file)
      } else {
        alert('Please upload a PDF file only')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📄 Upload Your Resume
        </h3>

        {!uploadedResume ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-blue-600 font-medium">
                  {isAnalyzing ? 'Analyzing ATS compatibility...' : 'Uploading resume...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your resume here</p>
                  <p className="text-gray-500">or click to browse files</p>
                  <p className="text-sm text-gray-400 mt-2">PDF files only • Max 10MB</p>
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <div className="text-sm text-green-600 font-medium">
                  💰 Earn 50 coins for uploading your resume!
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-green-800">{uploadedResume.name}</p>
                <p className="text-sm text-green-600">
                  {uploadedResume.size} • Uploaded on {uploadedResume.uploadDate}
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedResume(null)
                  setAtsAnalysis(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ATS Analysis Results */}
      {atsAnalysis && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 ATS Compatibility Analysis
          </h3>

          {/* Overall Score */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">ATS Score</span>
              <span className={`text-2xl font-bold ${atsAnalysis.color}`}>
                {atsAnalysis.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${atsAnalysis.score >= 80 ? 'bg-green-500' :
                  atsAnalysis.score >= 60 ? 'bg-blue-500' :
                    atsAnalysis.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${atsAnalysis.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-sm font-medium ${atsAnalysis.color}`}>
                {atsAnalysis.rating}
              </span>
              <span className="text-sm text-gray-500">
                {atsAnalysis.totalKeywords} relevant keywords found
              </span>
            </div>
          </div>

          {/* Analysis Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">✅ Resume Structure</h4>
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 ${atsAnalysis.analysis.hasContactInfo ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{atsAnalysis.analysis.hasContactInfo ? '✓' : '✗'}</span>
                  <span className="text-sm">Contact Information</span>
                </div>
                <div className={`flex items-center space-x-2 ${atsAnalysis.analysis.hasExperience ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{atsAnalysis.analysis.hasExperience ? '✓' : '✗'}</span>
                  <span className="text-sm">Work Experience Section</span>
                </div>
                <div className={`flex items-center space-x-2 ${atsAnalysis.analysis.hasEducation ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{atsAnalysis.analysis.hasEducation ? '✓' : '✗'}</span>
                  <span className="text-sm">Education Section</span>
                </div>
                <div className={`flex items-center space-x-2 ${atsAnalysis.analysis.hasSkills ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{atsAnalysis.analysis.hasSkills ? '✓' : '✗'}</span>
                  <span className="text-sm">Skills Section</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">🔑 Keyword Categories</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Technical Skills</span>
                  <span className="text-sm font-medium text-blue-600">
                    {atsAnalysis.foundKeywords.technical.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experience Terms</span>
                  <span className="text-sm font-medium text-blue-600">
                    {atsAnalysis.foundKeywords.experience.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Soft Skills</span>
                  <span className="text-sm font-medium text-blue-600">
                    {atsAnalysis.foundKeywords.soft.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Education Terms</span>
                  <span className="text-sm font-medium text-blue-600">
                    {atsAnalysis.foundKeywords.education.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">💡 Recommendations</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2">
                {atsAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span className="text-sm text-blue-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Found Keywords */}
          {Object.keys(atsAnalysis.foundKeywords).some(category =>
            atsAnalysis.foundKeywords[category].length > 0
          ) && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">🎯 Keywords Found</h4>
                <div className="space-y-3">
                  {Object.entries(atsAnalysis.foundKeywords).map(([category, keywords]) => (
                    keywords.length > 0 && (
                      <div key={category}>
                        <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                          {category.replace('_', ' ')} ({keywords.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

ResumeUpload.propTypes = {
  onResumeAnalyzed: PropTypes.func.isRequired,
  onCoinsUpdate: PropTypes.func.isRequired
}

export default ResumeUpload
