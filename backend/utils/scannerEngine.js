const stopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'using', 'experience', 'work',
  'years', 'role', 'team', 'company', 'required', 'job', 'skills', 'knowledge', 'position', 'ability', 'candidate',
  'responsibilities', 'duties', 'requirements', 'support', 'management', 'development', 'strong', 'working',
  'plus', 'degree', 'preferred', 'equivalent'
]);

const SKILLS_DICTIONARY = [
  // Languages & Core Web
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'golang', 'rust', 'swift', 'kotlin',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite', 'graphql',
  // Frameworks & Libraries
  'react', 'angular', 'vue', 'next\\.js', 'svelte', 'node\\.js', 'express', 'django', 'flask', 'spring boot', 'laravel',
  // Databases & Caching
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  // Cloud & DevOps
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'devops',
  // Concepts & Architecture
  'rest api', 'soap', 'microservices', 'serverless', 'unit testing', 'jest', 'agile', 'scrum', 'kanban', 'jira',
  // Data & ML
  'machine learning', 'deep learning', 'data science', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
  // General Industry
  'project management', 'product management', 'business analysis', 'data analysis', 'sql', 'excel', 'powerbi',
  'tableau', 'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
  'marketing', 'seo', 'sales', 'customer service', 'finance', 'accounting', 'hr', 'human resources'
];

/**
 * Extracts key skills and terms from the job description
 */
function extractJobKeywords(jdText) {
  const lowercaseJd = jdText.toLowerCase();
  const foundKeywords = new Set();

  // 1. Check for dictionary skills (including support for multi-word phrases and special chars)
  SKILLS_DICTIONARY.forEach(skillPattern => {
    // Escape for regex and check word boundary, allowing optional plural "s"
    let regexStr = `\\b${skillPattern}s?\\b`;
    if (skillPattern.endsWith('\\+\\+')) {
      regexStr = `\\b${skillPattern}`; // c++ doesn't have a standard word boundary at the end
    } else if (skillPattern.endsWith('\\.js')) {
      regexStr = `\\b${skillPattern}`;
    }
    const regex = new RegExp(regexStr, 'gi');
    if (regex.test(lowercaseJd)) {
      // Clean backslashes for display
      const cleanSkillName = skillPattern.replace(/\\/g, '');
      foundKeywords.add(cleanSkillName);
    }
  });

  // 2. Fallback: extract high frequency words that are not stopwords
  const words = lowercaseJd.match(/\b[a-z]{3,}\b/g) || [];
  const wordCounts = {};
  words.forEach(word => {
    if (!stopwords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  // Add words with frequency >= 3 that are not already matched
  Object.keys(wordCounts).forEach(word => {
    if (wordCounts[word] >= 3 && foundKeywords.size < 20) {
      foundKeywords.add(word);
    }
  });

  return Array.from(foundKeywords);
}

/**
 * Analyzes resume text against job description keywords
 */
function analyzeResume(resumeText, jdText) {
  const lowercaseResume = resumeText.toLowerCase();
  const jdKeywords = extractJobKeywords(jdText);

  if (jdKeywords.length === 0) {
    return {
      matchScore: 0,
      matchingKeywords: [],
      missingKeywords: [],
      suggestions: [
        {
          category: 'Job Description',
          message: 'The job description looks too brief or does not include enough specific keywords. Try sharing a more detailed description for a better scan.'
        }
      ]
    };
  }

  const matchingKeywords = [];
  const missingKeywords = [];

  // Match keywords against the resume text
  jdKeywords.forEach(keyword => {
    // Escape special regex chars inside keyword for safe matching, allowing optional plural "s"
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regexStr = `\\b${escapedKeyword}s?\\b`;
    if (keyword.endsWith('++') || keyword.endsWith('.js')) {
      regexStr = `\\b${escapedKeyword}`;
    }
    const regex = new RegExp(regexStr, 'i');
    if (regex.test(lowercaseResume)) {
      matchingKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // Calculate Match Score
  const rawScore = (matchingKeywords.length / jdKeywords.length) * 100;
  const matchScore = Math.round(rawScore);

  const suggestions = [];

  // 1. Missing Keyword Suggestions (Max 5 for relevance)
  if (missingKeywords.length > 0) {
    const skillsToHighlight = missingKeywords.slice(0, 5);
    skillsToHighlight.forEach(skill => {
      suggestions.push({
        category: 'Skills',
        message: `Consider integrating the skill "${skill.toUpperCase()}" into your experience or skills section, as it is highlighted in the job description.`
      });
    });
  }

  // 2. Contact Information Checks
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const phoneRegex = /(\+?[0-9\s-]{10,20})/g;

  const hasEmail = emailRegex.test(lowercaseResume);
  const hasPhone = phoneRegex.test(lowercaseResume);

  if (!hasEmail) {
    suggestions.push({
      category: 'Contact Info',
      message: 'We could not identify a valid email address. Please list your contact details clearly at the top of your resume.'
    });
  }
  if (!hasPhone) {
    suggestions.push({
      category: 'Contact Info',
      message: 'We could not find a phone number. Add a phone contact so recruiters can reach you easily.'
    });
  }

  // 3. Structural Sections Checks
  const sections = [
    { name: 'Education', terms: ['education', 'degree', 'university', 'college', 'gpa', 'academic'] },
    { name: 'Experience', terms: ['experience', 'work history', 'employment', 'professional background', 'position', 'internship'] },
    { name: 'Skills', terms: ['skills', 'technologies', 'core competencies', 'technical skills', 'expertise'] },
    { name: 'Projects', terms: ['projects', 'personal projects', 'portfolio', 'accomplishments'] }
  ];

  sections.forEach(section => {
    const hasSection = section.terms.some(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(lowercaseResume);
    });
    if (!hasSection) {
      suggestions.push({
        category: 'Formatting',
        message: `Your resume seems to be missing a clear section for "${section.name}". Adding a dedicated "${section.name}" header will improve readability for both humans and scanners.`
      });
    }
  });

  // 4. Length check
  const wordCount = (lowercaseResume.match(/\b\w+\b/g) || []).length;
  if (wordCount < 150) {
    suggestions.push({
      category: 'Formatting',
      message: 'Your resume is very brief. Try adding more detail to your professional experience and school projects to describe your contributions.'
    });
  } else if (wordCount > 1200) {
    suggestions.push({
      category: 'Formatting',
      message: 'Your resume exceeds 1200 words. Try to trim unnecessary details and consolidate points to keep it to a clean 1 or 2-page format.'
    });
  }

  return {
    matchScore,
    matchingKeywords,
    missingKeywords,
    suggestions
  };
}

module.exports = {
  extractJobKeywords,
  analyzeResume
};
