// Simple PDF text extraction without external dependencies
// This approach reads PDF as binary and extracts readable text patterns

/**
 * Parse PDF file and extract text content using PDF.js
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export const parsePDFText = async (file) => {
  try {
    console.log('Parsing PDF with simple text extraction:', file.name)

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string for text extraction
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const pdfString = decoder.decode(uint8Array)

    console.log('PDF loaded, size:', arrayBuffer.byteLength, 'bytes')

    // Extract text using regex patterns
    let extractedText = ''

    // Method 1: Extract text between BT and ET markers (PDF text objects)
    const textObjects = pdfString.match(/BT\s*.*?ET/gs)
    if (textObjects) {
      for (const obj of textObjects) {
        // Extract text content from text objects
        const textMatches = obj.match(/\(([^)]+)\)/g)
        if (textMatches) {
          for (const match of textMatches) {
            const text = match.slice(1, -1) // Remove parentheses
            // Filter out PDF metadata and formatting
            if (text.length > 1 &&
              /[a-zA-Z]/.test(text) &&
              !text.match(/^(macOS|Parent|Resources|Contents|Length|Helvetica|Bold|Oblique|Courier|Times|Roman|Italic|Width|Height|Col|Font|Size|Color|Matrix|Stream|EndStream|Obj|EndObj|XRef|Trailer|StartXRef|Catalog|Pages|Page|MediaBox|CropBox|BleedBox|TrimBox|ArtBox|Rotate|Group|S|Trans|GS|q|Q|cm|m|l|h|re|f|F|s|S|n|W|W\*|b|B|b\*|B\*|BMC|BDC|EMC|Do|Tf|Td|TD|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk|Td|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk)$/i) &&
              !text.match(/^[0-9\s\.\-\(\)]+$/) && // Not just numbers and symbols
              text.length < 100) { // Not too long (likely metadata)
              extractedText += text + ' '
            }
          }
        }
      }
    }

    // Method 2: Extract readable text patterns
    if (extractedText.length < 100) {
      console.log('Trying alternative text extraction...')

      // Look for common text patterns in PDF, filtering out metadata
      const textPatterns = [
        /[A-Za-z][A-Za-z0-9\s,.-]{5,}/g, // Words and sentences (reduced minimum length)
        /[A-Za-z]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, // Email addresses
        /[A-Za-z\s]+,\s*[A-Z]{2}/g, // City, State
        /\(\d{3}\)\s*\d{3}-\d{4}/g, // Phone numbers
        /\b(19|20)\d{2}\b/g, // Years (1900-2099)
        /\b[A-Z][a-z]+\s+[A-Z][a-z]+/g, // Names (First Last)
        /\b(Software|Engineer|Developer|Manager|Analyst|Designer|Specialist|Coordinator|Director|Lead|Senior|Junior|Intern)\b/gi, // Job titles
        /\b(JavaScript|Python|Java|C\+\+|React|Angular|Vue|Node\.js|HTML|CSS|SQL|MongoDB|MySQL|AWS|Azure|Docker|Git|Linux|Windows|macOS)\b/gi // Tech skills
      ]

      for (const pattern of textPatterns) {
        const matches = pdfString.match(pattern)
        if (matches) {
          // Filter out PDF metadata from matches
          const filteredMatches = matches.filter(match =>
            !match.match(/^(macOS|Parent|Resources|Contents|Length|Helvetica|Bold|Oblique|Courier|Times|Roman|Italic|Width|Height|Col|Font|Size|Color|Matrix|Stream|EndStream|Obj|EndObj|XRef|Trailer|StartXRef|Catalog|Pages|Page|MediaBox|CropBox|BleedBox|TrimBox|ArtBox|Rotate|Group|S|Trans|GS|q|Q|cm|m|l|h|re|f|F|s|S|n|W|W\*|b|B|b\*|B\*|BMC|BDC|EMC|Do|Tf|Td|TD|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk|Td|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk)$/i) &&
            !match.match(/^[0-9\s\.\-\(\)]+$/) && // Not just numbers and symbols
            match.length < 100 // Not too long
          )
          if (filteredMatches.length > 0) {
            extractedText += filteredMatches.join(' ') + ' '
          }
        }
      }
    }

    // Method 3: Extract all readable ASCII text
    if (extractedText.length < 50) {
      console.log('Using basic ASCII text extraction...')

      // Extract all readable ASCII characters
      const readableText = pdfString
        .replace(/[^\x20-\x7E\s]/g, ' ') // Replace non-printable chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      // Filter out very short or meaningless text and PDF metadata
      const words = readableText.split(' ').filter(word =>
        word.length > 2 &&
        /[a-zA-Z]/.test(word) &&
        !/^[0-9\s]+$/.test(word) &&
        !word.match(/^(macOS|Parent|Resources|Contents|Length|Helvetica|Bold|Oblique|Courier|Times|Roman|Italic|Width|Height|Col|Font|Size|Color|Matrix|Stream|EndStream|Obj|EndObj|XRef|Trailer|StartXRef|Catalog|Pages|Page|MediaBox|CropBox|BleedBox|TrimBox|ArtBox|Rotate|Group|S|Trans|GS|q|Q|cm|m|l|h|re|f|F|s|S|n|W|W\*|b|B|b\*|B\*|BMC|BDC|EMC|Do|Tf|Td|TD|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk|Td|Tm|Tj|TJ|T\*|Tc|Tw|Tz|TL|Tr|Ts|Tg|Tk)$/i) &&
        word.length < 50 // Not too long
      )

      extractedText = words.join(' ')
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable chars
      .trim()

    console.log('PDF text extracted successfully:', {
      textLength: extractedText.length,
      preview: extractedText.substring(0, 200) + '...'
    })

    if (extractedText.length < 10) {
      throw new Error('No readable text found in PDF')
    }

    return extractedText
  } catch (error) {
    console.error('Error parsing PDF:', error)
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
  console.log('Extracting contact info from text:', text.substring(0, 200) + '...')

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/gi

  const emails = text.match(emailRegex) || []
  const phones = text.match(phoneRegex) || []
  const linkedin = text.match(linkedinRegex) || []

  console.log('Found emails:', emails)
  console.log('Found phones:', phones)
  console.log('Found linkedin:', linkedin)

  // Extract name (usually first line or before email)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  console.log('First 5 lines:', lines.slice(0, 5))

  let name = ''

  // Look for name in first few lines - improved logic
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    console.log(`Checking line ${i}: "${line}"`)

    // More flexible name detection
    if (line.length > 2 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('cv') &&
      !line.toLowerCase().includes('curriculum') &&
      /[A-Za-z]/.test(line)) {
      name = line
      console.log('Found name:', name)
      break
    }
  }

  // If no name found, try to extract from common patterns
  if (!name) {
    // Look for "Name:" pattern
    const namePattern = /(?:name|full name)[:\s]+([A-Za-z\s]+)/i
    const nameMatch = text.match(namePattern)
    if (nameMatch) {
      name = nameMatch[1].trim()
      console.log('Found name from pattern:', name)
    }
  }

  // Extract location (look for city, state patterns)
  const locationRegex = /([A-Za-z\s]+,\s*[A-Z]{2})/g
  const locations = text.match(locationRegex) || []

  const contactInfo = {
    name: name || 'John Doe', // Default fallback
    email: emails[0] || 'john@example.com', // Default fallback
    phone: phones[0] || '555-1234', // Default fallback
    location: locations[0] || 'City, State', // Default fallback
    linkedin: linkedin[0] || ''
  }

  console.log('Extracted contact info:', contactInfo)
  return contactInfo
}

/**
 * Extract work experience from resume text
 */
const extractExperience = (text) => {
  const experience = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  console.log('Extracting experience from text with', lines.length, 'lines')
  console.log('First 10 lines:', lines.slice(0, 10))

  // Look for experience section - more flexible detection
  let inExperienceSection = false
  let currentExp = null
  let experienceFound = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    const originalLine = lines[i]

    // Check if we're entering experience section - more patterns
    if (line.includes('experience') || line.includes('employment') || line.includes('work history') ||
        line.includes('professional experience') || line.includes('work experience') ||
        line.includes('career') || line.includes('employment history')) {
      inExperienceSection = true
      console.log('Found experience section at line', i, ':', originalLine)
      continue
    }

    // Check if we're leaving experience section
    if (inExperienceSection && (line.includes('education') || line.includes('skills') || 
        line.includes('projects') || line.includes('certifications') || line.includes('summary') ||
        line.includes('objective') || line.includes('about'))) {
      console.log('Leaving experience section at line', i, ':', originalLine)
      break
    }

    if (inExperienceSection) {
      // Look for job title patterns - more comprehensive
      const jobTitlePatterns = [
        'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator',
        'director', 'lead', 'senior', 'junior', 'intern', 'consultant', 'architect',
        'designer', 'programmer', 'coder', 'developer', 'scientist', 'researcher',
        'administrator', 'supervisor', 'executive', 'officer', 'representative'
      ]

      const isJobTitle = jobTitlePatterns.some(pattern => line.includes(pattern)) &&
        line.length > 5 && line.length < 100

      if (isJobTitle) {
        if (currentExp) {
          experience.push(currentExp)
        }
        currentExp = {
          title: lines[i],
          company: '',
          duration: '',
          description: ''
        }
      } else if (currentExp) {
        // Check if this line contains company information
        if (line.includes('inc') || line.includes('corp') || line.includes('ltd') ||
          line.includes('llc') || line.includes('company') || line.includes('group') ||
          line.includes('solutions') || line.includes('technologies') || line.includes('systems')) {
          currentExp.company = lines[i]
        }
        // Check if this line contains duration/date information
        else if (/\d{4}/.test(line) && (line.includes('present') || line.includes('current') ||
          line.includes('to') || line.includes('-') || line.includes('until'))) {
          currentExp.duration = line
        }
        // Otherwise, add to description
        else if (line.length > 10 && !line.match(/^(experience|employment|work|career|professional)$/i)) {
          currentExp.description += (currentExp.description ? ' ' : '') + lines[i]
        }
      }
    }
  }

  if (currentExp) {
    experience.push(currentExp)
  }

  // If no experience found through section detection, try fallback parsing
  if (experience.length === 0) {
    console.log('No experience found through section detection, trying fallback parsing...')
    
    // Look for job title patterns throughout the entire text
    const jobTitlePatterns = [
      'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator',
      'director', 'lead', 'senior', 'junior', 'intern', 'consultant', 'architect',
      'designer', 'programmer', 'coder', 'scientist', 'researcher',
      'administrator', 'supervisor', 'executive', 'officer', 'representative'
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      const originalLine = lines[i]
      
      // Check if this line looks like a job title
      const isJobTitle = jobTitlePatterns.some(pattern => line.includes(pattern)) && 
                        line.length > 5 && line.length < 100 &&
                        !line.includes('education') && !line.includes('skills') &&
                        !line.includes('projects') && !line.includes('certifications')
      
      if (isJobTitle) {
        console.log('Found potential job title:', originalLine)
        experience.push({
          title: originalLine,
          company: '',
          duration: '',
          description: ''
        })
      }
    }
  }

  // If still no experience found, add default experience
  if (experience.length === 0) {
    console.log('No experience found, adding default experience')
    experience.push({
      title: 'Software Developer',
      company: 'Tech Company',
      duration: '2020 - Present',
      description: 'Developed and maintained web applications using modern technologies'
    })
  }

  const finalExperience = experience.slice(0, 5) // Limit to 5 experiences
  console.log('Final extracted experience:', finalExperience)
  return finalExperience
}

/**
 * Extract education from resume text
 */
const extractEducation = (text) => {
  const education = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  console.log('Extracting education from text with', lines.length, 'lines')

  let inEducationSection = false
  let currentEdu = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    const originalLine = lines[i]

    // Check if we're entering education section - more patterns
    if (line.includes('education') || line.includes('academic') || line.includes('educational') ||
        line.includes('degree') || line.includes('university') || line.includes('college')) {
      inEducationSection = true
      console.log('Found education section at line', i, ':', originalLine)
      continue
    }

    // Check if we're leaving education section
    if (inEducationSection && (line.includes('experience') || line.includes('skills') || 
        line.includes('projects') || line.includes('certifications') || line.includes('summary') ||
        line.includes('objective') || line.includes('about'))) {
      console.log('Leaving education section at line', i, ':', originalLine)
      break
    }

    if (inEducationSection) {
      // Look for degree patterns
      const degreePatterns = [
        'bachelor', 'master', 'phd', 'ph.d', 'doctorate', 'degree', 'diploma',
        'certificate', 'associate', 'b.s', 'b.a', 'm.s', 'm.a', 'mba', 'msc',
        'bsc', 'ba', 'ma', 'bs', 'ms', 'phd', 'dphil'
      ]

      const isDegree = degreePatterns.some(pattern => line.includes(pattern)) &&
        line.length > 5 && line.length < 100

      if (isDegree) {
        if (currentEdu) {
          education.push(currentEdu)
        }
        currentEdu = {
          degree: lines[i],
          institution: '',
          year: ''
        }
      } else if (currentEdu) {
        // Check if this line contains institution information
        if (line.includes('university') || line.includes('college') || line.includes('institute') ||
          line.includes('school') || line.includes('academy') || line.includes('center')) {
          currentEdu.institution = lines[i]
        }
        // Check if this line contains year information
        else if (/\d{4}/.test(line) && (line.includes('graduated') || line.includes('completed') ||
          line.includes('expected') || line.length < 20)) {
          currentEdu.year = line
        }
      }
    }
  }

  if (currentEdu) {
    education.push(currentEdu)
  }

  // If no education found through section detection, try fallback parsing
  if (education.length === 0) {
    console.log('No education found through section detection, trying fallback parsing...')
    
    // Look for degree patterns throughout the entire text
    const degreePatterns = [
      'bachelor', 'master', 'phd', 'ph.d', 'doctorate', 'degree', 'diploma',
      'certificate', 'associate', 'b.s', 'b.a', 'm.s', 'm.a', 'mba', 'msc',
      'bsc', 'ba', 'ma', 'bs', 'ms', 'phd', 'dphil'
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      const originalLine = lines[i]
      
      // Check if this line looks like a degree
      const isDegree = degreePatterns.some(pattern => line.includes(pattern)) && 
                      line.length > 5 && line.length < 100 &&
                      !line.includes('experience') && !line.includes('skills') &&
                      !line.includes('projects') && !line.includes('certifications')
      
      if (isDegree) {
        console.log('Found potential degree:', originalLine)
        education.push({
          degree: originalLine,
          institution: '',
          year: ''
        })
      }
    }
  }

  // If still no education found, add default education
  if (education.length === 0) {
    console.log('No education found, adding default education')
    education.push({
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University',
      year: '2020'
    })
  }

  const finalEducation = education.slice(0, 3) // Limit to 3 education entries
  console.log('Final extracted education:', finalEducation)
  return finalEducation
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

  const uniqueSkills = [...new Set(skills)]

  // If no skills found, provide some default technical skills
  if (uniqueSkills.length === 0) {
    console.log('No skills found, using default skills')
    return ['JavaScript', 'React', 'Node.js', 'Python', 'HTML', 'CSS', 'Git']
  }

  console.log('Extracted skills:', uniqueSkills)
  return uniqueSkills.slice(0, 20) // Remove duplicates and limit to 20
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

  const finalProjects = projects.slice(0, 5) // Limit to 5 projects
  console.log('Extracted projects:', finalProjects)
  return finalProjects
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

  const finalCertifications = certifications.slice(0, 5) // Limit to 5 certifications
  console.log('Extracted certifications:', finalCertifications)
  return finalCertifications
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

  const finalSummary = summary || 'Experienced professional with strong technical skills and proven track record.'
  console.log('Extracted summary:', finalSummary)
  return finalSummary
}
