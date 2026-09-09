const { extractJobKeywords, analyzeResume } = require('./scannerEngine');

// Mock data
const sampleJobDescription = `
We are looking for a React Developer with strong experience in Node.js, Express, JavaScript, and MongoDB.
Familiarity with Docker, GCP, Git, and REST APIs is a plus.
`;

const sampleResumePass = `
John Doe
Email: john.doe@example.com
Phone: +1-123-456-7890

Education:
B.S. in Computer Science

Experience:
React Developer at TechCorp. Built web pages using React and Node.js.
Maintained databases using MongoDB and built REST APIs.

Skills:
JavaScript, Node.js, React, Git, Docker, MongoDB
`;

const sampleResumeFail = `
Jane Smith
Graphic designer with experience in Photoshop and Illustrator.
`;

console.log("--- Testing Scanner Engine ---");

// Test 1: keyword extraction
const extracted = extractJobKeywords(sampleJobDescription);
console.log("Extracted Keywords:", extracted);
const hasExpectedKeywords = ['react', 'node.js', 'mongodb', 'git', 'docker', 'gcp', 'rest api'].every(k => 
  extracted.includes(k)
);

if (hasExpectedKeywords) {
  console.log("Keyword extraction test passed.");
} else {
  console.log("Keyword extraction test failed.");
}

// Test 2: matching - high score
const resultPass = analyzeResume(sampleResumePass, sampleJobDescription);
console.log("Pass Resume Match Score:", resultPass.matchScore + "%");
console.log("Pass Resume Matching Keywords:", resultPass.matchingKeywords);
console.log("Pass Resume Missing Keywords:", resultPass.missingKeywords);
console.log("Pass Resume Suggestions:", resultPass.suggestions);

// The only missing section should be "Projects" since it has Contact details, Education, Experience, Skills
const missingProjectsSection = resultPass.suggestions.some(s => s.message.includes('Projects'));
if (resultPass.matchScore > 50 && missingProjectsSection) {
  console.log("High score resume test passed.");
} else {
  console.log("High score resume test failed.");
}

// Test 3: matching - low score
const resultFail = analyzeResume(sampleResumeFail, sampleJobDescription);
console.log("Fail Resume Match Score:", resultFail.matchScore + "%");
console.log("Fail Resume Suggestions Count:", resultFail.suggestions.length);

const hasContactAlert = resultFail.suggestions.some(s => s.category === 'Contact Info');
const hasFormattingAlert = resultFail.suggestions.some(s => s.category === 'Formatting');

if (resultFail.matchScore === 0 && hasContactAlert && hasFormattingAlert) {
  console.log("Low score resume test passed.");
} else {
  console.log("Low score resume test failed.");
}

console.log("--- Tests Completed ---");
if (hasExpectedKeywords && resultPass.matchScore > 50 && resultFail.matchScore === 0) {
  console.log("SUCCESS: All tests completed correctly.");
  process.exit(0);
} else {
  console.log("FAILURE: Some test cases failed.");
  process.exit(1);
}
