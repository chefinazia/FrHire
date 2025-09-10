import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Parse PDF file and extract text using pdf-lib (browser-compatible)
export const parsePDFFile = async (file) => {
  try {
    console.log('Starting PDF parsing with pdf-lib...');

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Note: pdf-lib doesn't have built-in text extraction
    // For now, we'll return null to use fallback parsing
    console.log('PDF loaded successfully, pages:', pages.length);
    return null; // Return null to use fallback parsing

  } catch (error) {
    console.error('PDF parsing error:', error);
    return null;
  }
};

// Parse resume text and extract structured data
export const parseResumeText = (text) => {
  try {

    // Clean the text - preserve line breaks for parsing
    const cleanText = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();

    // Extract contact information
    const extractContactInfo = (text) => {
      const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const phonePattern = /(\+?[\d\s\-()]{10,})/g;
      const locationPattern = /(?:Location|Address|City)[:\s]*([^,\n|]+)/i;

      const email = text.match(emailPattern)?.[0] || '';
      const phone = text.match(phonePattern)?.[0]?.replace(/\s+/g, ' ').trim() || '';
      let location = text.match(locationPattern)?.[1]?.trim() || '';

      // If no location found with pattern, try to extract from contact line that ends with location
      if (!location) {
        // Look for email | phone | location pattern
        const contactLineMatch = text.match(/[^@\n]+@[^@\n]+\s*\|\s*[^|]+\s*\|\s*([^|\n]+)/);
        if (contactLineMatch) {
          const potentialLocation = contactLineMatch[1].trim();
          // Don't use this as location if it contains social media keywords
          if (!/(github|linkedin|leetcode|facebook|instagram|http)/i.test(potentialLocation)) {
            location = potentialLocation;
          }
        }

        // Alternative: Look for standalone location in early lines
        if (!location) {
          const lines = text.split('\n').slice(0, 8);
          for (const line of lines) {
            const trimmedLine = line.trim();
            // Check if line looks like a location (city, state format)
            if (trimmedLine.length > 0 &&
              trimmedLine.length < 40 &&
              !trimmedLine.includes('@') &&
              !trimmedLine.includes('+') &&
              !/(github|linkedin|leetcode|summary|experience|skills|projects|education)/i.test(trimmedLine) &&
              (trimmedLine.includes(',') || /^[A-Za-z\s]+$/i.test(trimmedLine))) {
              location = trimmedLine;
              break;
            }
          }
        }
      }

      // Extract name - look for name patterns or use first line that doesn't contain common resume keywords
      const namePattern = /(?:Name|Full Name)[:\s]*([^,\n]+)/i;
      const nameMatch = text.match(namePattern);

      let name = '';
      if (nameMatch) {
        name = nameMatch[1].trim();
        console.log('Found name via pattern:', name);
      } else {
        // Get first line and check if it's not a section header
        const firstLine = text.split('\n')[0].trim();
        const sectionHeaders = ['PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'TECHNICAL SKILLS', 'SKILLS', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'RESUME'];
        const isSectionHeader = sectionHeaders.some(header => firstLine.toUpperCase().includes(header));

        if (!isSectionHeader && firstLine.length > 0 && firstLine.length < 50) {
          // Check if the first line contains a job title (has | separator)
          if (firstLine.includes('|')) {
            // Extract just the name part before the |
            const namePart = firstLine.split('|')[0].trim();
            if (namePart.length > 0 && namePart.length < 50) {
              name = namePart;
            } else {
              // If name part is too long, try to extract just the first two words
              const words = firstLine.split(' ').slice(0, 2);
              name = words.join(' ');
            }
          } else {
            name = firstLine;
          }
        } else {
          // Look for a line that looks like a name (contains letters, spaces, and is reasonably short)
          const lines = text.split('\n');
          for (const line of lines.slice(0, 10)) { // Check first 10 lines
            const trimmedLine = line.trim();
            if (trimmedLine.length > 0 &&
              trimmedLine.length < 50 &&
              /^[A-Za-z\s\.]+$/.test(trimmedLine) &&
              !sectionHeaders.some(header => trimmedLine.toUpperCase().includes(header)) &&
              !trimmedLine.includes('|') && // Not a job title line
              !trimmedLine.includes('@') && // Not an email line
              !trimmedLine.includes('+') && // Not a phone line
              !trimmedLine.includes('http') && // Not a URL line
              !trimmedLine.includes('•') && // Not a bullet point
              trimmedLine.split(' ').length <= 3) { // Not too many words
              name = trimmedLine;
              break;
            }
          }
        }
      }

      // Extract social profiles from the first 15 lines
      const socialProfiles = {};
      const lines = text.split('\n').slice(0, 15);
      for (const line of lines) {
        const githubMatch = line.match(/github[:\s]+([^|\s]+)/i);
        if (githubMatch) socialProfiles.github = githubMatch[1];
        const leetcodeMatch = line.match(/leetcode[:\s]+([^|\s]+)/i);
        if (leetcodeMatch) socialProfiles.leetcode = leetcodeMatch[1];
        const linkedinMatch = line.match(/linkedin[:\s]+([^|\s]+)/i);
        if (linkedinMatch) socialProfiles.linkedin = linkedinMatch[1];
      }

      return { name, email, phone, location, socialProfiles };
    };

    // Extract summary
    const extractSummary = (text) => {
      const summaryPatterns = [
        /(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is,
        /(?:ABOUT\s+ME|ABOUT)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is
      ];

      for (const pattern of summaryPatterns) {
        const match = text.match(pattern);
        if (match) {
          let summary = match[1].trim();

          // Clean up the summary - remove bullet points and skills-like content
          summary = summary
            .replace(/^[•*-]\s*/gm, '') // Remove bullet points
            .replace(/\n[•*-]\s*/g, ' ') // Replace bullet points with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

          // Stop at common section headers that might be included
          const stopPatterns = [
            /TECHNICAL\s+SKILLS/i,
            /SKILLS/i,
            /EXPERIENCE/i,
            /EDUCATION/i,
            /PROJECTS/i,
            /CERTIFICATIONS/i
          ];

          for (const stopPattern of stopPatterns) {
            const stopMatch = summary.match(stopPattern);
            if (stopMatch) {
              summary = summary.substring(0, stopMatch.index).trim();
              break;
            }
          }

          // Also stop at bullet points that might indicate skills (but be more careful)
          const bulletMatch = summary.match(/[•*-]\s*(Programming|Frontend|Backend|Database|Cloud|Tools|Frameworks)/i);
          if (bulletMatch) {
            summary = summary.substring(0, bulletMatch.index).trim();
          }

          // Stop at any line that starts with all caps (likely a section header)
          const sectionHeaderMatch = summary.match(/\n[A-Z\s]{3,}\n/);
          if (sectionHeaderMatch) {
            summary = summary.substring(0, sectionHeaderMatch.index).trim();
          }

          // If summary is too short, try to get more content
          if (summary.length < 50) {
            // Look for the full summary in the original text
            const fullSummaryMatch = text.match(/(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is);
            if (fullSummaryMatch) {
              let fullSummary = fullSummaryMatch[1].trim();
              // Clean up the full summary
              fullSummary = fullSummary
                .replace(/^[•*-]\s*/gm, '')
                .replace(/\n[•*-]\s*/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

              // Stop at skills section
              const skillsStopMatch = fullSummary.match(/[•*-]\s*(Programming|Frontend|Backend|Database|Cloud|Tools|Frameworks)/i);
              if (skillsStopMatch) {
                fullSummary = fullSummary.substring(0, skillsStopMatch.index).trim();
              }

              if (fullSummary.length > summary.length) {
                summary = fullSummary;
              }
            }
          }

          return summary.substring(0, 500);
        }
      }
      return '';
    };

    // Extract skills
    const extractSkills = (text) => {
      const skillsPatterns = [
        /(?:TECHNICAL\s+SKILLS|SKILLS|TECHNOLOGIES)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is,
        /(?:CORE\s+COMPETENCIES)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is
      ];

      for (const pattern of skillsPatterns) {
        const match = text.match(pattern);
        if (match) {
          const skillsText = match[1];
          const skills = [];

          // Split by bullet points and process each line
          const lines = skillsText.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              // Remove bullet points and clean up
              const cleanLine = line.replace(/^[•*-]\s*/, '').trim();
              if (cleanLine) {
                // Check if line contains category (e.g., "Programming Languages: JavaScript, TypeScript")
                if (cleanLine.includes(':')) {
                  const [, skillsList] = cleanLine.split(':', 2);

                  // Add individual skills from the list (split by • or comma)
                  if (skillsList) {
                    const individualSkills = skillsList
                      .split(/[•,]/)
                      .map(skill => skill.trim())
                      .filter(skill => skill.length > 0 && skill.length < 30);
                    skills.push(...individualSkills);
                  }
                } else {
                  // If no colon, treat as individual skills
                  const lineSkills = cleanLine
                    .split(/[•,]/)
                    .map(skill => skill.trim())
                    .filter(skill => skill.length > 0 && skill.length < 30);
                  skills.push(...lineSkills);
                }
              }
            }
          }

          return skills.slice(0, 30);
        }
      }
      return [];
    };

    // Extract experience with improved parsing
    const extractExperience = (text) => {
      // Look for experience section with multiple patterns
      const expKeywords = ['PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT', 'CAREER HISTORY', 'EXPERIENCE'];
      let expText = '';

      for (const keyword of expKeywords) {
        const keywordIndex = text.toUpperCase().indexOf(keyword);
        if (keywordIndex !== -1) {
          // Find the content after the keyword
          const afterKeyword = text.substring(keywordIndex + keyword.length);
          const lines = afterKeyword.split('\n');

          // Skip empty lines and find the start of content
          let contentStart = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().length > 0) {
              contentStart = i;
              break;
            }
          }

          // Find the end of experience section (next major section)
          let contentEnd = lines.length;
          for (let i = contentStart + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0 && line.match(/^[A-Z\s]+$/) && !line.includes('|') && !line.startsWith('•')) {
              contentEnd = i;
              break;
            }
          }

          expText = lines.slice(contentStart, contentEnd).join('\n');
          break;
        }
      }

      if (!expText) return [];

      const jobs = [];
      const lines = expText.split('\n').filter(line => line.trim().length > 0);

      let currentJob = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if this line looks like a job title (contains | and has job-related words or year pattern)
        if (line.includes('|') && (
          line.includes('Developer') ||
          line.includes('Engineer') ||
          line.includes('Manager') ||
          line.includes('Officer') ||
          line.includes('Associate') ||
          line.includes('CTO') ||
          line.includes('CEO') ||
          line.includes('Director') ||
          line.includes('Lead') ||
          line.includes('Senior') ||
          line.includes('Analyst') ||
          line.includes('Consultant') ||
          line.includes('Specialist') ||
          line.includes('Coordinator') ||
          line.includes('Supervisor') ||
          line.includes('Software') ||
          line.includes('Programmer') ||
          line.includes('Architect') ||
          line.match(/\d{4}/) // Contains year pattern
        )) {
          // Save previous job if exists
          if (currentJob && currentJob.title && currentJob.company) {
            jobs.push(currentJob);
          }

          // Parse new job line
          const parts = line.split('|').map(part => part.trim());
          currentJob = {
            title: parts[0] || '',
            company: parts[1] || '',
            duration: parts[2] || '',
            description: ''
          };
        } else if (currentJob && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          // Add bullet point to current job description
          const bulletText = line.replace(/^[•*-]\s*/, '').trim();
          if (bulletText) {
            currentJob.description += (currentJob.description ? '\n• ' : '• ') + bulletText;
          }
        } else if (currentJob && line.length > 10 && !line.includes('|') && !line.match(/^\d{4}/)) {
          // Add non-bullet description lines (but not years or job titles)
          currentJob.description += (currentJob.description ? '\n• ' : '• ') + line;
        }
      }

      // Add the last job
      if (currentJob && currentJob.title && currentJob.company) {
        jobs.push(currentJob);
      }

      return jobs.slice(0, 6);
    };

    // Extract education
    const extractEducation = (text) => {
      const eduPatterns = [
        /(?:EDUCATION|ACADEMIC\s+QUALIFICATIONS|SCHOOL|DEGREES)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is,
        /(?:ACADEMIC\s+BACKGROUND)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is
      ];

      let eduText = '';
      for (const pattern of eduPatterns) {
        const match = text.match(pattern);
        if (match) {
          eduText = match[1];
          break;
        }
      }

      if (!eduText) return [];

      const education = [];
      const lines = eduText.split('\n').filter(line => line.trim().length > 0);

      for (const line of lines) {
        if (line.includes('|')) {
          const parts = line.split('|').map(part => part.trim());
          const degree = parts[0] || '';
          const institution = parts[1] || '';
          const yearAndCgpa = parts.slice(2).join(' | '); // Join all parts after institution

          // Extract year and CGPA from the combined parts
          const yearMatch = yearAndCgpa.match(/(\d{4}-\d{4}|\d{4})/);
          const cgpaMatch = yearAndCgpa.match(/CGPA[:\s]*([0-9.]+)\/?[0-9.]*/i);

          education.push({
            degree: degree,
            institution: institution,
            year: yearMatch ? yearMatch[1] : '',
            cgpa: cgpaMatch ? cgpaMatch[1] : ''
          });
        } else if (line.trim().length > 10) {
          // Try to extract degree, institution, year, and CGPA from single line
          const yearMatch = line.match(/(\d{4}-\d{4}|\d{4})/);
          const cgpaMatch = line.match(/CGPA[:\s]*([0-9.]+)\/?[0-9.]*/i);

          // Split by common separators to find degree and institution
          const parts = line.split(/[|,]/).map(part => part.trim());
          let degree = '';
          let institution = '';

          if (parts.length >= 2) {
            degree = parts[0];
            institution = parts[1];
          } else {
            // Try to split by common patterns
            const degreeMatch = line.match(/(Bachelor|Master|PhD|B\.Tech|M\.Tech|B\.E|M\.E|B\.S|M\.S)[^|]*/i);
            if (degreeMatch) {
              degree = degreeMatch[0].trim();
              const remaining = line.replace(degreeMatch[0], '').trim();
              institution = remaining.split(/\d{4}/)[0].trim();
            }
          }

          education.push({
            degree: degree,
            institution: institution,
            year: yearMatch ? yearMatch[1] : '',
            cgpa: cgpaMatch ? cgpaMatch[1] : ''
          });
        }
      }

      // Filter out empty education entries
      return education.filter(edu => edu.degree && edu.degree.trim().length > 0).slice(0, 4);
    };

    // Extract projects
    const extractProjects = (text) => {
      const projPatterns = [
        /(?:PROJECTS|PERSONAL\s+PROJECTS|PORTFOLIO)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is,
        /(?:KEY\s+PROJECTS)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is
      ];

      let projText = '';
      for (const pattern of projPatterns) {
        const match = text.match(pattern);
        if (match) {
          projText = match[1];
          break;
        }
      }

      if (!projText) return [];

      const projects = [];
      const lines = projText.split('\n').filter(line => line.trim().length > 0);

      let currentProject = null;

      for (const line of lines) {
        if (line.includes('|')) {
          // Save previous project
          if (currentProject && currentProject.title) {
            projects.push(currentProject);
          }

          const parts = line.split('|').map(part => part.trim());
          currentProject = {
            title: parts[0] || '',
            description: parts[1] || '',
            technologies: parts[2] || ''
          };
        } else if (currentProject && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          const bulletText = line.replace(/^[•*-]\s*/, '').trim();
          if (bulletText) {
            currentProject.description += (currentProject.description ? ' ' : '') + bulletText;
          }
        }
      }

      if (currentProject && currentProject.title) {
        projects.push(currentProject);
      }

      return projects.slice(0, 4);
    };

    // Extract certifications
    const extractCertifications = (text) => {
      const certPatterns = [
        /(?:CERTIFICATIONS|CERTIFICATES|PROFESSIONAL\s+CERTIFICATIONS)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is,
        /(?:LICENSES)[:\s]*([^#]+?)(?=\n[A-Z\s]+\n|$)/is
      ];

      let certText = '';
      for (const pattern of certPatterns) {
        const match = text.match(pattern);
        if (match) {
          certText = match[1];
          break;
        }
      }

      if (!certText) return [];

      const certifications = [];
      const lines = certText.split('\n').filter(line => line.trim().length > 0);

      for (const line of lines) {
        if (line.trim().length > 5) {
          const yearMatch = line.match(/(\d{4})/);
          const year = yearMatch ? yearMatch[1] : '';

          // Remove year from the line to get name and issuer
          let nameAndIssuer = line.replace(/\d{4}/, '').trim();

          // Try to split by | to separate name and issuer
          if (nameAndIssuer.includes('|')) {
            const parts = nameAndIssuer.split('|').map(part => part.trim());
            const name = parts[0] || '';
            const issuer = parts[1] || '';

            certifications.push({
              name: name,
              issuer: issuer,
              date: year
            });
          } else {
            // Try to extract issuer from common patterns
            const issuerPatterns = [
              /(Amazon Web Services|AWS)/i,
              /(Google Cloud|GCP)/i,
              /(Microsoft|Azure)/i,
              /(Cisco)/i,
              /(Oracle)/i,
              /(IBM)/i,
              /(Salesforce)/i,
              /(Adobe)/i
            ];

            let issuer = 'Professional Certification';
            for (const pattern of issuerPatterns) {
              const match = nameAndIssuer.match(pattern);
              if (match) {
                issuer = match[1];
                nameAndIssuer = nameAndIssuer.replace(pattern, '').trim();
                break;
              }
            }

            certifications.push({
              name: nameAndIssuer,
              issuer: issuer,
              date: year
            });
          }
        }
      }

      return certifications.slice(0, 6);
    };

    // Parse all sections
    const contactInfo = extractContactInfo(cleanText);
    const summary = extractSummary(cleanText);
    const skills = extractSkills(cleanText);
    const experience = extractExperience(cleanText);
    const education = extractEducation(cleanText);
    const projects = extractProjects(cleanText);
    const certifications = extractCertifications(cleanText);

    const result = {
      contactInfo,
      summary,
      skills,
      experience,
      education,
      projects,
      certifications
    };

    return result;

  } catch (error) {
    console.error('Resume text parsing error:', error);
    return null;
  }
};

// Create PDF using pdf-lib (browser-compatible)
export const createResumePDF = async (formData) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 14;
    const sectionSpacing = 20;

    // Helper function to add text
    const addText = (text, x, y, fontSize = 12, font = helvetica, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = 60) => {
      if (yPosition < requiredSpace) {
        page = pdfDoc.addPage();
        yPosition = height - margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrapping and page breaks
    const addWrappedText = (text, x, y, maxWidth, fontSize = 12, font = helvetica, color = rgb(0, 0, 0)) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && line !== '') {
          // Check if we need a new page before drawing
          if (currentY < 50) {
            page = pdfDoc.addPage();
            currentY = height - margin;
          }

          addText(line, x, currentY, fontSize, font, color);
          line = word + ' ';
          currentY -= lineHeight;
        } else {
          line = testLine;
        }
      }

      // Check if we need a new page before drawing final line
      if (currentY < 50) {
        page = pdfDoc.addPage();
        currentY = height - margin;
      }

      addText(line, x, currentY, fontSize, font, color);
      return currentY - lineHeight;
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      checkPageBreak(80); // Ensure enough space for section header and content
      yPosition -= sectionSpacing;
      addText(title, margin, yPosition, 16, helveticaBold, rgb(0.15, 0.39, 0.44));
      yPosition -= lineHeight;
    };

    // Helper function to add horizontal line
    const addLine = () => {
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      yPosition -= 10;
    };

    // Contact Information
    if (formData.contactInfo?.name) {
      addText(formData.contactInfo.name, margin, yPosition, 20, helveticaBold, rgb(0.12, 0.16, 0.22));
      yPosition -= 30;
    }

    // Contact details
    const contactDetails = [];
    if (formData.contactInfo?.email) contactDetails.push(formData.contactInfo.email);
    if (formData.contactInfo?.phone) contactDetails.push(formData.contactInfo.phone);
    if (formData.contactInfo?.location) contactDetails.push(formData.contactInfo.location);

    if (contactDetails.length > 0) {
      addText(contactDetails.join(' | '), margin, yPosition, 12, helvetica, rgb(0.42, 0.45, 0.5));
      yPosition -= lineHeight;
    }

    // Add social profiles if available
    if (formData.contactInfo?.socialProfiles) {
      const socialLinks = [];
      if (formData.contactInfo.socialProfiles.linkedin) socialLinks.push(`LinkedIn: ${formData.contactInfo.socialProfiles.linkedin}`);
      if (formData.contactInfo.socialProfiles.github) socialLinks.push(`GitHub: ${formData.contactInfo.socialProfiles.github}`);
      if (formData.contactInfo.socialProfiles.leetcode) socialLinks.push(`LeetCode: ${formData.contactInfo.socialProfiles.leetcode}`);

      if (socialLinks.length > 0) {
        addText(socialLinks.join(' | '), margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
        yPosition -= lineHeight;
      }
    }

    addLine();

    // Professional Summary
    if (formData.summary) {
      addSectionHeader('PROFESSIONAL SUMMARY');
      yPosition = addWrappedText(formData.summary, margin, yPosition, width - 2 * margin, 11, helvetica);
      addLine();
    }

    // Technical Skills
    if (formData.skills && formData.skills.length > 0) {
      addSectionHeader('TECHNICAL SKILLS');
      yPosition = addWrappedText(formData.skills.join(' • '), margin, yPosition, width - 2 * margin, 11, helvetica);
      addLine();
    }

    // Professional Experience
    if (formData.experience && formData.experience.length > 0) {
      addSectionHeader('PROFESSIONAL EXPERIENCE');

      formData.experience.forEach(job => {
        if (job.title && job.company) {
          checkPageBreak(80); // Ensure space for job entry
          addText(`${job.title} | ${job.company}`, margin, yPosition, 12, helveticaBold);
          yPosition -= lineHeight;

          if (job.duration) {
            addText(job.duration, margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
            yPosition -= lineHeight;
          }

          if (job.description) {
            yPosition = addWrappedText(job.description, margin, yPosition, width - 2 * margin, 10, helvetica);
          }
          yPosition -= 10;
        }
      });
      addLine();
    }

    // Education
    if (formData.education && formData.education.length > 0) {
      addSectionHeader('EDUCATION');

      formData.education.forEach(edu => {
        if (edu.degree && edu.institution) {
          checkPageBreak(50); // Ensure space for education entry
          addText(`${edu.degree} | ${edu.institution}`, margin, yPosition, 11, helvetica);
          yPosition -= lineHeight;

          if (edu.year) {
            addText(edu.year, margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
            yPosition -= lineHeight;
          }
        }
      });
      addLine();
    }

    // Projects
    if (formData.projects && formData.projects.length > 0) {
      addSectionHeader('PROJECTS');

      formData.projects.forEach(project => {
        if (project.title) {
          checkPageBreak(60); // Ensure space for project entry
          addText(project.title, margin, yPosition, 12, helveticaBold);
          yPosition -= lineHeight;

          if (project.description) {
            yPosition = addWrappedText(project.description, margin, yPosition, width - 2 * margin, 10, helvetica);
          }

          if (project.technologies) {
            addText(`Technologies: ${project.technologies}`, margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
            yPosition -= lineHeight;
          }
          yPosition -= 5;
        }
      });
      addLine();
    }

    // Certifications
    if (formData.certifications && formData.certifications.length > 0) {
      addSectionHeader('CERTIFICATIONS');

      formData.certifications.forEach(cert => {
        if (cert.name) {
          checkPageBreak(50); // Ensure space for certification entry
          addText(cert.name, margin, yPosition, 11, helvetica);
          yPosition -= lineHeight;

          if (cert.issuer) {
            addText(cert.issuer, margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
            yPosition -= lineHeight;
          }

          if (cert.date) {
            addText(cert.date, margin, yPosition, 10, helvetica, rgb(0.42, 0.45, 0.5));
            yPosition -= lineHeight;
          }
        }
      });
    }

    // Convert to blob
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return blob;

  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
}

// ATS Scoring System inspired by https://github.com/Saanvi26/ATS-Scorer
export function calculateATSScore(resumeData, jobDescription = null) {
  try {
    let score = 0;
    let maxScore = 100;
    const breakdown = {
      contactInfo: { score: 0, max: 15, details: [] },
      summary: { score: 0, max: 15, details: [] },
      skills: { score: 0, max: 20, details: [] },
      experience: { score: 0, max: 25, details: [] },
      education: { score: 0, max: 10, details: [] },
      projects: { score: 0, max: 10, details: [] },
      formatting: { score: 0, max: 5, details: [] }
    };

    const suggestions = [];

    // 1. Contact Information (15 points)
    const contactInfo = resumeData.contactInfo || {};
    if (contactInfo.name && contactInfo.name.trim().length > 0) {
      breakdown.contactInfo.score += 5;
      breakdown.contactInfo.details.push('✓ Name present');
    } else {
      breakdown.contactInfo.details.push('✗ Missing name');
      suggestions.push('Add your full name');
    }

    if (contactInfo.email && contactInfo.email.includes('@')) {
      breakdown.contactInfo.score += 5;
      breakdown.contactInfo.details.push('✓ Valid email');
    } else {
      breakdown.contactInfo.details.push('✗ Missing or invalid email');
      suggestions.push('Add a professional email address');
    }

    if (contactInfo.phone && contactInfo.phone.trim().length > 0) {
      breakdown.contactInfo.score += 3;
      breakdown.contactInfo.details.push('✓ Phone number present');
    } else {
      breakdown.contactInfo.details.push('✗ Missing phone number');
      suggestions.push('Add your phone number');
    }

    if (contactInfo.location && contactInfo.location.trim().length > 0) {
      breakdown.contactInfo.score += 2;
      breakdown.contactInfo.details.push('✓ Location present');
    } else {
      breakdown.contactInfo.details.push('✗ Missing location');
      suggestions.push('Add your location (city, state)');
    }

    // 2. Professional Summary (15 points)
    if (resumeData.summary && resumeData.summary.trim().length > 50) {
      breakdown.summary.score += 15;
      breakdown.summary.details.push('✓ Professional summary present');

      // Check for action verbs and quantifiable achievements
      const actionVerbs = ['achieved', 'built', 'created', 'developed', 'implemented', 'led', 'managed', 'optimized', 'designed', 'delivered'];
      const numbers = resumeData.summary.match(/\d+/g);

      if (actionVerbs.some(verb => resumeData.summary.toLowerCase().includes(verb))) {
        breakdown.summary.details.push('✓ Contains action verbs');
      }

      if (numbers && numbers.length > 0) {
        breakdown.summary.details.push('✓ Contains quantifiable achievements');
      }
    } else if (resumeData.summary && resumeData.summary.trim().length > 0) {
      breakdown.summary.score += 8;
      breakdown.summary.details.push('⚠ Summary too short (recommend 2-3 sentences)');
      suggestions.push('Expand your professional summary to 2-3 sentences highlighting key achievements');
    } else {
      breakdown.summary.details.push('✗ Missing professional summary');
      suggestions.push('Add a professional summary highlighting your key skills and experience');
    }

    // 3. Skills (20 points)
    const skills = resumeData.skills || [];
    if (skills.length >= 8) {
      breakdown.skills.score += 20;
      breakdown.skills.details.push(`✓ ${skills.length} skills listed`);
    } else if (skills.length >= 5) {
      breakdown.skills.score += 15;
      breakdown.skills.details.push(`⚠ ${skills.length} skills listed (recommend 8+)`);
      suggestions.push('Add more relevant technical skills to reach at least 8 skills');
    } else if (skills.length > 0) {
      breakdown.skills.score += 8;
      breakdown.skills.details.push(`✗ Only ${skills.length} skills listed`);
      suggestions.push('Add more technical skills (aim for 8-12 relevant skills)');
    } else {
      breakdown.skills.details.push('✗ No skills listed');
      suggestions.push('Add a technical skills section with relevant technologies');
    }

    // Check for trending tech skills
    const trendingSkills = ['react', 'node', 'javascript', 'typescript', 'python', 'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql'];
    const skillsText = skills.join(' ').toLowerCase();
    const trendingCount = trendingSkills.filter(skill => skillsText.includes(skill)).length;

    if (trendingCount >= 3) {
      breakdown.skills.details.push('✓ Contains trending technologies');
    }

    // 4. Experience (25 points)
    const experience = resumeData.experience || [];
    if (experience.length >= 3) {
      breakdown.experience.score += 20;
      breakdown.experience.details.push(`✓ ${experience.length} work experiences`);
    } else if (experience.length >= 1) {
      breakdown.experience.score += 12;
      breakdown.experience.details.push(`⚠ ${experience.length} work experience(s) (recommend 3+)`);
      suggestions.push('Add more work experience entries if available');
    } else {
      breakdown.experience.details.push('✗ No work experience listed');
      suggestions.push('Add your work experience with job titles, companies, and achievements');
    }

    // Check for quantifiable achievements in experience
    let hasQuantifiableResults = false;
    experience.forEach(exp => {
      if (exp.description && /\d+%|\d+\+|\$\d+|increased|improved|reduced|saved/.test(exp.description)) {
        hasQuantifiableResults = true;
      }
    });

    if (hasQuantifiableResults) {
      breakdown.experience.score += 5;
      breakdown.experience.details.push('✓ Contains quantifiable achievements');
    } else if (experience.length > 0) {
      breakdown.experience.details.push('⚠ Missing quantifiable achievements');
      suggestions.push('Add specific metrics and achievements to your experience descriptions');
    }

    // 5. Education (10 points)
    const education = resumeData.education || [];
    if (education.length >= 1) {
      breakdown.education.score += 10;
      breakdown.education.details.push(`✓ Education listed`);
    } else {
      breakdown.education.details.push('✗ No education listed');
      suggestions.push('Add your educational background');
    }

    // 6. Projects (10 points)
    const projects = resumeData.projects || [];
    if (projects.length >= 2) {
      breakdown.projects.score += 10;
      breakdown.projects.details.push(`✓ ${projects.length} projects listed`);
    } else if (projects.length === 1) {
      breakdown.projects.score += 8;
      breakdown.projects.details.push('⚠ 1 project listed (recommend 2)');
      suggestions.push('Add one more project to showcase your skills');
    } else {
      breakdown.projects.details.push('✗ No projects listed');
      suggestions.push('Add 1-2 relevant projects with technologies used');
    }

    // 7. Formatting & Structure (5 points)
    breakdown.formatting.score += 5; // Always give full points for our structured format
    breakdown.formatting.details.push('✓ Well-structured format');

    // Calculate total score
    Object.values(breakdown).forEach(section => {
      score += section.score;
    });

    // Calculate percentage
    const percentage = Math.round((score / maxScore) * 100);

    // Overall rating
    let rating = 'Poor';
    if (percentage >= 90) rating = 'Excellent';
    else if (percentage >= 80) rating = 'Very Good';
    else if (percentage >= 70) rating = 'Good';
    else if (percentage >= 60) rating = 'Fair';

    // Job description matching (if provided)
    let jobMatchScore = null;
    if (jobDescription) {
      jobMatchScore = calculateJobMatch(resumeData, jobDescription);
    }

    return {
      totalScore: score,
      maxScore,
      percentage,
      rating,
      breakdown,
      suggestions,
      jobMatch: jobMatchScore,
      detectedKeywords: extractKeywords(resumeData)
    };

  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return null;
  }
}

// Helper function to calculate job description match
function calculateJobMatch(resumeData, jobDescription) {
  try {
    const jobKeywords = extractJobKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeData);

    const matchedKeywords = jobKeywords.filter(keyword =>
      resumeKeywords.some(resumeKeyword =>
        resumeKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(resumeKeyword.toLowerCase())
      )
    );

    const matchPercentage = Math.round((matchedKeywords.length / jobKeywords.length) * 100);

    return {
      matchPercentage,
      matchedKeywords,
      missingKeywords: jobKeywords.filter(keyword => !matchedKeywords.includes(keyword)),
      totalJobKeywords: jobKeywords.length
    };
  } catch (error) {
    console.error('Error calculating job match:', error);
    return null;
  }
}

// Helper function to extract keywords from resume data
function extractKeywords(resumeData) {
  const keywords = new Set();

  // Extract from skills
  if (resumeData.skills) {
    resumeData.skills.forEach(skill => {
      keywords.add(skill.trim());
    });
  }

  // Extract from summary
  if (resumeData.summary) {
    const summaryWords = resumeData.summary.match(/\b[A-Z][a-z]+(?:\.[a-z]+)*\b/g) || [];
    summaryWords.forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }

  // Extract from experience descriptions
  if (resumeData.experience) {
    resumeData.experience.forEach(exp => {
      if (exp.description) {
        const expWords = exp.description.match(/\b[A-Z][a-z]+(?:\.[a-z]+)*\b/g) || [];
        expWords.forEach(word => {
          if (word.length > 3) keywords.add(word);
        });
      }
    });
  }

  return Array.from(keywords);
}

// Helper function to extract keywords from job description
function extractJobKeywords(jobDescription) {
  const commonTechKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'HTML', 'CSS', 'TypeScript', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS',
    'Docker', 'Kubernetes', 'Git', 'REST', 'API', 'GraphQL', 'Redis',
    'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby', 'PHP',
    'C++', 'C#', '.NET', 'Swift', 'Kotlin', 'Flutter', 'React Native'
  ];

  const keywords = new Set();
  const jobText = jobDescription.toLowerCase();

  // Extract technical keywords
  commonTechKeywords.forEach(keyword => {
    if (jobText.includes(keyword.toLowerCase())) {
      keywords.add(keyword);
    }
  });

  // Extract other important words
  const words = jobDescription.match(/\b[A-Za-z]{3,}\b/g) || [];
  words.forEach(word => {
    if (word.length > 4 && !['required', 'experience', 'skills', 'knowledge'].includes(word.toLowerCase())) {
      keywords.add(word);
    }
  });

  return Array.from(keywords).slice(0, 20); // Limit to top 20 keywords
};
