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

  // Comprehensive ATS Keywords for ALL technology stacks and fields
  const atsKeywords = {
    // Frontend Technologies
    frontend: [
      'react', 'vue.js', 'angular', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
      'javascript', 'typescript', 'html', 'css', 'sass', 'scss', 'less',
      'tailwind', 'bootstrap', 'material-ui', 'chakra-ui', 'styled-components',
      'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint', 'prettier'
    ],
    // Backend Technologies
    backend: [
      'node.js', 'express', 'nest.js', 'python', 'django', 'flask', 'fastapi',
      'java', 'spring', 'spring boot', 'hibernate', 'c#', '.net', 'asp.net',
      'php', 'laravel', 'symfony', 'ruby', 'rails', 'go', 'gin', 'rust',
      'kotlin', 'scala', 'clojure', 'elixir', 'phoenix'
    ],
    // Mobile Development
    mobile: [
      'react native', 'flutter', 'dart', 'swift', 'ios', 'android', 'kotlin',
      'objective-c', 'xamarin', 'ionic', 'cordova', 'phonegap', 'unity',
      'flutter web', 'expo', 'react navigation'
    ],
    // Databases & Storage
    database: [
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
      'oracle', 'sql server', 'dynamodb', 'cassandra', 'neo4j', 'firebase',
      'supabase', 'prisma', 'sequelize', 'mongoose', 'typeorm'
    ],
    // Cloud & DevOps
    cloud: [
      'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform',
      'ansible', 'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci',
      'helm', 'istio', 'prometheus', 'grafana', 'elk stack', 'datadog'
    ],
    // Data Science & AI
    datascience: [
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
      'jupyter', 'r', 'matlab', 'spark', 'hadoop', 'kafka', 'airflow',
      'mlflow', 'kubeflow', 'tableau', 'power bi', 'looker', 'snowflake'
    ],
    // Security & Testing
    security: [
      'cybersecurity', 'penetration testing', 'owasp', 'ssl', 'encryption',
      'oauth', 'jwt', 'ldap', 'active directory', 'burp suite', 'metasploit',
      'wireshark', 'nessus', 'vulnerability assessment', 'compliance'
    ],
    // Testing Frameworks
    testing: [
      'jest', 'cypress', 'selenium', 'junit', 'testng', 'mocha', 'chai',
      'puppeteer', 'playwright', 'enzyme', 'testing library', 'karma',
      'jasmine', 'rspec', 'pytest', 'unittest'
    ],
    // Methodologies & Practices
    methodologies: [
      'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
      'clean code', 'solid principles', 'design patterns', 'mvp', 'mvc',
      'rest api', 'graphql', 'grpc', 'soap', 'serverless'
    ],
    // Business & Soft Skills
    soft: [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'project management', 'collaboration', 'adaptability', 'creativity', 'initiative',
      'mentoring', 'cross-functional', 'stakeholder management', 'client facing',
      'time management', 'critical thinking', 'innovation', 'strategic planning'
    ],
    // Action Verbs for Experience
    experience: [
      'developed', 'implemented', 'designed', 'architected', 'built', 'created',
      'managed', 'led', 'coordinated', 'optimized', 'improved', 'delivered',
      'achieved', 'increased', 'reduced', 'streamlined', 'automated', 'scaled',
      'migrated', 'integrated', 'deployed', 'maintained', 'collaborated',
      'mentored', 'trained', 'supervised', 'analyzed', 'researched'
    ],
    // Education & Certifications
    education: [
      'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute',
      'certification', 'diploma', 'course', 'training', 'bootcamp', 'workshop',
      'aws certified', 'google certified', 'microsoft certified', 'cisco certified',
      'oracle certified', 'comptia', 'cissp', 'cisa', 'pmp', 'scrum master'
    ],
    // Industry-Specific Terms
    fintech: [
      'fintech', 'blockchain', 'cryptocurrency', 'defi', 'payment processing',
      'financial modeling', 'risk management', 'compliance', 'banking',
      'trading algorithms', 'fraud detection', 'kyc', 'aml'
    ],
    healthcare: [
      'healthcare', 'hipaa', 'ehr', 'emr', 'fhir', 'medical devices',
      'telemedicine', 'clinical trials', 'pharmaceuticals', 'biotech',
      'medical imaging', 'health informatics', 'patient data'
    ],
    ecommerce: [
      'e-commerce', 'shopify', 'magento', 'woocommerce', 'payment gateways',
      'inventory management', 'order management', 'customer analytics',
      'conversion optimization', 'seo', 'digital marketing', 'crm'
    ]
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Strict file validation
      const validationResult = validateFile(file)
      if (validationResult.isValid) {
        handleResumeUpload(file)
      } else {
        alert(validationResult.error)
        event.target.value = ''
      }
    }
  }

  const validateFile = (file) => {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { isValid: false, error: 'Only PDF files are allowed. Please convert your resume to PDF format.' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large. Please compress your PDF to under 10MB.' }
    }

    // Check filename for suspicious characters
    const fileName = file.name
    const validFileNameRegex = /^[a-zA-Z0-9._\-\s()]+\.pdf$/i
    if (!validFileNameRegex.test(fileName)) {
      return { isValid: false, error: 'Invalid filename. Please use only letters, numbers, spaces, dots, dashes, and parentheses.' }
    }

    return { isValid: true }
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
    const foundKeywords = {}
    const categoryScores = {}
    const categoryWeights = {
      frontend: 1.2,      // High weight for technical skills
      backend: 1.2,
      mobile: 1.2,
      database: 1.1,
      cloud: 1.1,
      datascience: 1.1,
      security: 1.0,
      testing: 1.0,
      methodologies: 0.9,
      soft: 0.8,          // Lower weight for soft skills
      experience: 1.0,
      education: 0.9,
      fintech: 1.1,       // Industry-specific boost
      healthcare: 1.1,
      ecommerce: 1.1
    }

    let totalScore = 0
    let maxPossibleScore = 0
    let overallFoundCount = 0

    // Analyze each category with weighted scoring
    Object.keys(atsKeywords).forEach(category => {
      foundKeywords[category] = []
      let categoryFound = 0

      atsKeywords[category].forEach(keyword => {
        const weight = categoryWeights[category] || 1
        maxPossibleScore += weight

        if (resumeText.includes(keyword.toLowerCase())) {
          foundKeywords[category].push(keyword)
          categoryFound++
          totalScore += weight
          overallFoundCount++
        }
      })

      // Calculate category score percentage
      const categoryTotal = atsKeywords[category].length * (categoryWeights[category] || 1)
      const categoryActual = categoryFound * (categoryWeights[category] || 1)
      categoryScores[category] = categoryTotal > 0 ? Math.round((categoryActual / categoryTotal) * 100) : 0
    })

    // Calculate overall ATS score (more strict)
    const atsScore = Math.round((totalScore / maxPossibleScore) * 100)

    // Enhanced structure analysis
    const structureAnalysis = {
      hasContactInfo: resumeText.includes('email') || resumeText.includes('phone') || resumeText.includes('@'),
      hasExperience: resumeText.includes('experience') || resumeText.includes('work') || resumeText.includes('employed'),
      hasEducation: resumeText.includes('education') || resumeText.includes('degree') || resumeText.includes('university') || resumeText.includes('college'),
      hasSkills: resumeText.includes('skills') || resumeText.includes('technologies') || resumeText.includes('programming'),
      hasProjects: resumeText.includes('project') || resumeText.includes('portfolio') || resumeText.includes('github'),
      hasCertifications: resumeText.includes('certified') || resumeText.includes('certification') || resumeText.includes('license'),
      hasMetrics: /\d+%|\d+x|\$\d+|\d+\s*(users|customers|revenue|growth|improvement|reduction|increase)/i.test(resumeText),
      hasActionVerbs: foundKeywords.experience.length > 3,
      standardSections: 0
    }

    // Count standard sections
    const sectionKeywords = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications']
    structureAnalysis.standardSections = sectionKeywords.filter(section =>
      resumeText.includes(section)
    ).length

    // More strict rating criteria
    let rating, color, recommendations, criticalIssues = []

    if (atsScore >= 85 && structureAnalysis.standardSections >= 4 && structureAnalysis.hasMetrics) {
      rating = 'Excellent'
      color = 'text-green-600'
      recommendations = [
        'Outstanding ATS optimization!',
        'Excellent keyword coverage across multiple domains',
        'Great use of metrics and quantifiable achievements',
        'Well-structured with standard sections'
      ]
    } else if (atsScore >= 70 && structureAnalysis.standardSections >= 3) {
      rating = 'Good'
      color = 'text-blue-600'
      recommendations = [
        'Good ATS compatibility with room for improvement',
        'Add more industry-specific keywords',
        'Include more quantifiable achievements with metrics',
        'Consider adding certifications section',
        'Expand technical skills coverage'
      ]
    } else if (atsScore >= 50 && structureAnalysis.hasContactInfo) {
      rating = 'Fair'
      color = 'text-yellow-600'
      recommendations = [
        'Moderate ATS compatibility - needs significant improvement',
        'Add more relevant technical keywords for your field',
        'Include measurable accomplishments with numbers',
        'Use more action verbs in experience descriptions',
        'Add missing standard sections (Skills, Projects, etc.)',
        'Include industry-specific terminology'
      ]
    } else {
      rating = 'Poor'
      color = 'text-red-600'
      recommendations = [
        'Major ATS optimization needed',
        'Add comprehensive technical skills section',
        'Include relevant industry keywords',
        'Use standard resume section headings',
        'Add quantifiable achievements with metrics',
        'Include professional certifications',
        'Use more action verbs to describe experiences'
      ]
    }

    // Identify critical issues
    if (!structureAnalysis.hasContactInfo) criticalIssues.push('Missing contact information')
    if (!structureAnalysis.hasExperience) criticalIssues.push('No experience section found')
    if (!structureAnalysis.hasSkills) criticalIssues.push('No skills section found')
    if (!structureAnalysis.hasMetrics) criticalIssues.push('No quantifiable achievements found')
    if (structureAnalysis.standardSections < 3) criticalIssues.push('Missing standard resume sections')

    // Identify top performing categories
    const topCategories = Object.entries(categoryScores)
      .filter(([, score]) => score > 20)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, score]) => ({ category, score }))

    // Identify weak categories
    const weakCategories = Object.entries(categoryScores)
      .filter(([category, score]) => score === 0 && atsKeywords[category].length > 5)
      .map(([category]) => category)

    return {
      score: atsScore,
      rating,
      color,
      foundKeywords,
      categoryScores,
      totalKeywords: overallFoundCount,
      recommendations,
      criticalIssues,
      topCategories,
      weakCategories,
      analysis: structureAnalysis,
      detailedMetrics: {
        totalCategories: Object.keys(atsKeywords).length,
        categoriesWithKeywords: Object.values(foundKeywords).filter(arr => arr.length > 0).length,
        averageCategoryScore: Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length,
        keywordDensity: (overallFoundCount / resumeText.split(' ').length * 100).toFixed(2)
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
      const validationResult = validateFile(file)
      if (validationResult.isValid) {
        handleResumeUpload(file)
      } else {
        alert(validationResult.error)
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
                  <div className="text-sm text-gray-400 mt-2 space-y-1">
                    <p>📄 PDF files only • Up to 10MB</p>
                    <p>✅ Standard fonts recommended</p>
                    <p>🎯 Include relevant keywords for your field</p>
                  </div>
                </div >
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <div className="text-sm text-green-600 font-medium">
                  💰 Earn 50 coins for uploading your resume!
                </div>
              </div >
            )}
          </div >
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
      </div >

      {/* Enhanced ATS Analysis Results */}
      {
        atsAnalysis && (
          <div className="space-y-6">
            {/* Main Score Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">🎯 ATS Compatibility Score</h3>
                <div className={`text-4xl font-bold ${atsAnalysis.color}`}>
                  {atsAnalysis.score}%
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${atsAnalysis.score >= 85 ? 'bg-green-500' :
                    atsAnalysis.score >= 70 ? 'bg-blue-500' :
                      atsAnalysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${atsAnalysis.score}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-lg font-semibold ${atsAnalysis.color}`}>
                  {atsAnalysis.rating}
                </span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {atsAnalysis.totalKeywords} keywords • {atsAnalysis.detailedMetrics.keywordDensity}% density
                  </div>
                  <div className="text-xs text-gray-500">
                    {atsAnalysis.detailedMetrics.categoriesWithKeywords}/{atsAnalysis.detailedMetrics.totalCategories} categories covered
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Issues Alert */}
            {atsAnalysis.criticalIssues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Critical Issues</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {atsAnalysis.criticalIssues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-700">
                      <span className="text-red-500">⚠</span>
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Resume Structure */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Structure Analysis
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'hasContactInfo', label: 'Contact Info', icon: '📧' },
                    { key: 'hasExperience', label: 'Experience', icon: '💼' },
                    { key: 'hasEducation', label: 'Education', icon: '🎓' },
                    { key: 'hasSkills', label: 'Skills', icon: '⚡' },
                    { key: 'hasProjects', label: 'Projects', icon: '🚀' },
                    { key: 'hasCertifications', label: 'Certifications', icon: '🏆' },
                    { key: 'hasMetrics', label: 'Metrics', icon: '📊' }
                  ].map(({ key, label, icon }) => (
                    <div key={key} className={`flex items-center justify-between py-1 px-2 rounded text-sm ${atsAnalysis.analysis[key] ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                      <span className="flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </span>
                      <span className="font-medium">
                        {atsAnalysis.analysis[key] ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Categories */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🏅</span>
                  Top Categories
                </h4>
                {atsAnalysis.topCategories.length > 0 ? (
                  <div className="space-y-2">
                    {atsAnalysis.topCategories.map(({ category, score }, index) => (
                      <div key={category} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded">
                        <span className="text-sm font-medium text-green-800 capitalize">
                          #{index + 1} {category.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm font-bold text-green-600">{score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No strong categories found</p>
                )}
              </div>

              {/* Weak Areas */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Needs Improvement
                </h4>
                {atsAnalysis.weakCategories.length > 0 ? (
                  <div className="space-y-2">
                    {atsAnalysis.weakCategories.slice(0, 4).map((category) => (
                      <div key={category} className="py-2 px-3 bg-red-50 rounded">
                        <span className="text-sm font-medium text-red-800 capitalize">
                          {category.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="text-xs text-red-600 mt-1">
                          No keywords found
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 italic">All major categories covered!</p>
                )}
              </div>
            </div>

            {/* Category Scores Grid */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Category Performance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(atsAnalysis.categoryScores).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm ${score >= 70 ? 'bg-green-500' :
                      score >= 40 ? 'bg-yellow-500' :
                        score > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                      {score}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1 capitalize">
                      {category.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {atsAnalysis.foundKeywords[category]?.length || 0} words
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Actionable Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atsAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-500 mt-1">💬</span>
                    <span className="text-sm text-blue-800 font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Found Keywords - Compact View */}
            {Object.values(atsAnalysis.foundKeywords).some(arr => arr.length > 0) && (
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Detected Keywords
                </h4>
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(atsAnalysis.foundKeywords).map(([category, keywords]) => (
                      keywords.length > 0 && (
                        <div key={category} className="bg-gray-50 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                            {category.replace(/([A-Z])/g, ' $1')} ({keywords.length})
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {keywords.slice(0, 6).map((keyword, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                            {keywords.length > 6 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{keywords.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  )
}

ResumeUpload.propTypes = {
  onResumeAnalyzed: PropTypes.func.isRequired,
  onCoinsUpdate: PropTypes.func.isRequired
}

export default ResumeUpload
