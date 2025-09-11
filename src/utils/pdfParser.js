import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker - try multiple sources
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (error) {
  console.warn('Failed to set PDF.js worker from CDN, using fallback')
  // Fallback to local worker if available
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
}

/**
 * Parse PDF file and extract text content using PDF.js
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export const parsePDFText = async (file) => {
  try {
    console.log('Parsing PDF with pdfjs-dist:', file.name)
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    console.log('PDF loaded, pages:', pdf.numPages)
    
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine text items
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
      
      fullText += pageText + '\n'
      console.log(`Page ${pageNum} text length:`, pageText.length)
    }
    
    console.log('PDF parsed successfully:', {
      pages: pdf.numPages,
      textLength: fullText.length
    })
    
    return fullText.trim()
  } catch (error) {
    console.error('Error parsing PDF with pdfjs-dist:', error)
    
    // Fallback: try to extract basic text using a simple approach
    try {
      console.log('Attempting fallback PDF parsing...')
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Simple text extraction - look for readable text patterns
      let text = ''
      const decoder = new TextDecoder('utf-8', { fatal: false })
      
      // Try to decode chunks of the PDF
      for (let i = 0; i < uint8Array.length; i += 1000) {
        const chunk = uint8Array.slice(i, i + 1000)
        const decoded = decoder.decode(chunk)
        
        // Extract readable text (basic filtering)
        const readableText = decoded.replace(/[^\x20-\x7E\s]/g, ' ').trim()
        if (readableText.length > 10) {
          text += readableText + ' '
        }
      }
      
      if (text.length > 50) {
        console.log('Fallback parsing successful, text length:', text.length)
        return text.trim()
      }
    } catch (fallbackError) {
      console.error('Fallback parsing also failed:', fallbackError)
    }
    
    throw new Error(`PDF parsing failed: ${error.message}`)
  }
}

/**
 * Enhanced resume text parser with better pattern matching
 * @param {string} resumeText - Raw text from PDF
 * @returns {Object} - Parsed resume data
 */
export const parseResumeText = (resumeText) => {
  try {
    console.log('Parsing resume text:', resumeText.substring(0, 200) + '...')

    if (!resumeText || resumeText.trim().length === 0) {
      console.warn('Empty resume text provided')
      return null
    }

    const text = resumeText.trim()
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    // Extract contact information
    const contactInfo = extractContactInfo(text)

    // Extract experience
    const experience = extractExperience(text)

    // Extract education
    const education = extractEducation(text)

    // Extract skills
    const skills = extractSkills(text)

    // Extract projects
    const projects = extractProjects(text)

    // Extract certifications
    const certifications = extractCertifications(text)

    // Extract summary/objective
    const summary = extractSummary(text)

    const parsedData = {
      contactInfo,
      experience,
      education,
      skills,
      projects,
      certifications,
      summary,
      rawText: text
    }

    console.log('Resume parsed successfully:', {
      contactInfo: !!contactInfo.name,
      experienceCount: experience.length,
      educationCount: education.length,
      skillsCount: skills.length,
      projectsCount: projects.length,
      certificationsCount: certifications.length,
      hasSummary: !!summary
    })

    return parsedData
  } catch (error) {
    console.error('Error parsing resume text:', error)
    return null
  }
}

/**
 * Extract contact information from resume text
 */
const extractContactInfo = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/gi

  const emails = text.match(emailRegex) || []
  const phones = text.match(phoneRegex) || []
  const linkedin = text.match(linkedinRegex) || []

  // Extract name (usually first line or before email)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let name = ''

  // Look for name in first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i]
    if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
      name = line
      break
    }
  }

  // Extract location (look for city, state patterns)
  const locationRegex = /([A-Za-z\s]+,\s*[A-Z]{2})/g
  const locations = text.match(locationRegex) || []

  return {
    name: name || 'Unknown',
    email: emails[0] || '',
    phone: phones[0] || '',
    location: locations[0] || '',
    linkedin: linkedin[0] || ''
  }
}

/**
 * Extract work experience from resume text
 */
const extractExperience = (text) => {
  const experience = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Look for experience section
  let inExperienceSection = false
  let currentExp = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    // Check if we're entering experience section
    if (line.includes('experience') || line.includes('employment') || line.includes('work history')) {
      inExperienceSection = true
      continue
    }

    // Check if we're leaving experience section
    if (inExperienceSection && (line.includes('education') || line.includes('skills') || line.includes('projects'))) {
      break
    }

    if (inExperienceSection) {
      // Look for job title patterns
      if (line.includes('developer') || line.includes('engineer') || line.includes('manager') ||
        line.includes('analyst') || line.includes('specialist') || line.includes('coordinator')) {
        if (currentExp) {
          experience.push(currentExp)
        }
        currentExp = {
          title: lines[i],
          company: '',
          duration: '',
          description: ''
        }
      } else if (currentExp && line.includes('company') || line.includes('inc') || line.includes('corp') || line.includes('ltd')) {
        currentExp.company = lines[i]
      } else if (currentExp && /\d{4}/.test(line)) {
        currentExp.duration = line
      } else if (currentExp && line.length > 10) {
        currentExp.description += (currentExp.description ? ' ' : '') + lines[i]
      }
    }
  }

  if (currentExp) {
    experience.push(currentExp)
  }

  return experience.slice(0, 5) // Limit to 5 experiences
}

/**
 * Extract education from resume text
 */
const extractEducation = (text) => {
  const education = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let inEducationSection = false
  let currentEdu = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (line.includes('education') || line.includes('academic')) {
      inEducationSection = true
      continue
    }

    if (inEducationSection && (line.includes('experience') || line.includes('skills') || line.includes('projects'))) {
      break
    }

    if (inEducationSection) {
      if (line.includes('bachelor') || line.includes('master') || line.includes('phd') ||
        line.includes('degree') || line.includes('university') || line.includes('college')) {
        if (currentEdu) {
          education.push(currentEdu)
        }
        currentEdu = {
          degree: lines[i],
          institution: '',
          year: ''
        }
      } else if (currentEdu && (line.includes('university') || line.includes('college') || line.includes('institute'))) {
        currentEdu.institution = lines[i]
      } else if (currentEdu && /\d{4}/.test(line)) {
        currentEdu.year = line
      }
    }
  }

  if (currentEdu) {
    education.push(currentEdu)
  }

  return education.slice(0, 3) // Limit to 3 education entries
}

/**
 * Extract skills from resume text
 */
const extractSkills = (text) => {
  const skills = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Common technical skills
  const techSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'jQuery',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
    'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS'
  ]

  // Look for skills section
  let inSkillsSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (line.includes('skills') || line.includes('technologies') || line.includes('tools')) {
      inSkillsSection = true
      continue
    }

    if (inSkillsSection && (line.includes('experience') || line.includes('education') || line.includes('projects'))) {
      break
    }

    if (inSkillsSection) {
      // Check for comma-separated skills
      if (line.includes(',')) {
        const lineSkills = line.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
        skills.push(...lineSkills)
      } else {
        // Check for individual skills
        for (const skill of techSkills) {
          if (line.toLowerCase().includes(skill.toLowerCase())) {
            skills.push(skill)
          }
        }
      }
    }
  }

  // Also search entire text for skills
  for (const skill of techSkills) {
    if (text.toLowerCase().includes(skill.toLowerCase()) && !skills.includes(skill)) {
      skills.push(skill)
    }
  }

  return [...new Set(skills)].slice(0, 20) // Remove duplicates and limit to 20
}

/**
 * Extract projects from resume text
 */
const extractProjects = (text) => {
  const projects = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let inProjectsSection = false
  let currentProject = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (line.includes('projects') || line.includes('portfolio')) {
      inProjectsSection = true
      continue
    }

    if (inProjectsSection && (line.includes('experience') || line.includes('education') || line.includes('skills'))) {
      break
    }

    if (inProjectsSection) {
      if (line.length > 5 && line.length < 50 && !line.includes('http')) {
        if (currentProject) {
          projects.push(currentProject)
        }
        currentProject = {
          name: lines[i],
          description: '',
          technologies: []
        }
      } else if (currentProject && line.length > 10) {
        currentProject.description += (currentProject.description ? ' ' : '') + lines[i]
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject)
  }

  return projects.slice(0, 5) // Limit to 5 projects
}

/**
 * Extract certifications from resume text
 */
const extractCertifications = (text) => {
  const certifications = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let inCertSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (line.includes('certification') || line.includes('certificate') || line.includes('license')) {
      inCertSection = true
      continue
    }

    if (inCertSection && (line.includes('experience') || line.includes('education') || line.includes('skills'))) {
      break
    }

    if (inCertSection && line.length > 5) {
      certifications.push({
        name: lines[i],
        issuer: '',
        year: ''
      })
    }
  }

  return certifications.slice(0, 5) // Limit to 5 certifications
}

/**
 * Extract summary/objective from resume text
 */
const extractSummary = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Look for summary/objective section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()

    if (line.includes('summary') || line.includes('objective') || line.includes('profile') || line.includes('about')) {
      // Get the next few lines as summary
      let summary = ''
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        if (lines[j].length > 10) {
          summary += (summary ? ' ' : '') + lines[j]
        }
      }
      if (summary.length > 20) {
        return summary
      }
    }
  }

  // If no explicit summary, use first few lines as summary
  let summary = ''
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    if (lines[i].length > 20 && !lines[i].includes('@') && !lines[i].includes('http')) {
      summary += (summary ? ' ' : '') + lines[i]
    }
  }

  return summary || 'Experienced professional with strong technical skills and proven track record.'
}
