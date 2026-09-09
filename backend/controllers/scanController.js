const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Scan = require('../models/Scan');
const { analyzeResume } = require('../utils/scannerEngine');

exports.uploadScan = async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim() === '') {
        return res.status(400).json({ msg: 'Please provide the job description' });
    }

    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload a resume file' });
    }

    try {
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const extension = originalName.split('.').pop().toLowerCase();
        let resumeText = '';

        if (extension === 'pdf') {
            const parsedPdf = await pdfParse(fileBuffer);
            resumeText = parsedPdf.text;
        } else if (extension === 'docx') {
            const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
            resumeText = parsedDocx.value;
        } else if (extension === 'txt') {
            resumeText = fileBuffer.toString('utf-8');
        } else {
            return res.status(400).json({ msg: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' });
        }

        if (!resumeText || resumeText.trim() === '') {
            return res.status(400).json({ msg: 'Could not extract text from the resume. Ensure it has readable text and is not an image-only document.' });
        }

        const analysis = analyzeResume(resumeText, jobDescription);

        const scan = new Scan({
            userId: req.user.id,
            resumeFileName: originalName,
            resumeText,
            jobDescriptionText: jobDescription,
            matchScore: analysis.matchScore,
            matchingKeywords: analysis.matchingKeywords,
            missingKeywords: analysis.missingKeywords,
            suggestions: analysis.suggestions
        });

        await scan.save();
        return res.json(scan);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error during scanning');
    }
};

exports.getUserScans = async (req, res) => {
    try {
        const scans = await Scan.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(scans);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error fetching scans');
    }
};

exports.getAllScans = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied: Admin privileges required' });
    }

    try {
        const scans = await Scan.find().populate('userId', 'email').sort({ createdAt: -1 });
        return res.json(scans);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error while fetching all scans');
    }
};

exports.getScanById = async (req, res) => {
    try {
        const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
        if (!scan) {
            return res.status(404).json({ msg: 'Scan not found' });
        }
        return res.json(scan);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error while fetching scan details');
    }
};

exports.deleteScan = async (req, res) => {
    try {
        const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!scan) {
            return res.status(404).json({ msg: 'Scan not found or unauthorized' });
        }
        return res.json({ msg: 'Scan deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error deleting scan');
    }
};

/**
 * Admin: Scan all stored resumes against a provided job description and optional role/threshold.
 * Returns a deduplicated list (one entry per user) keeping each user's highest ATS (matchScore),
 * sorted descending by score. No database schema changes required.
 */
exports.scanAll = async (req, res) => {
// Allow any authenticated user to perform a bulk scan across stored resumes per request
if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
    }

    const { jobRole = '', jobDescription = '', requiredAts = 0 } = req.body || {};

    if (!jobDescription || jobDescription.trim() === '') {
        return res.status(400).json({ msg: 'Please provide the job description to scan against' });
    }

    try {
        // Fetch all stored scans (they contain resumeText and userId)
        const allScans = await Scan.find().populate('userId', 'email').lean();

        // Map to hold best score per user
        const bestByUser = new Map();

        // Normalize role and jd for simple matching
        const normalizedRole = String(jobRole || '').trim().toLowerCase();

        for (let s of allScans) {
            if (!s.resumeText) continue;

            // If jobRole is provided, perform a lightweight check: resumeText or fileName contains role OR keywords from JD match role
            if (normalizedRole) {
                const resumeLower = (s.resumeText + ' ' + (s.resumeFileName || '')).toLowerCase();
                if (!resumeLower.includes(normalizedRole) && !(s.jobDescriptionText || '').toLowerCase().includes(normalizedRole)) {
                    // skip this resume as it does not seem relevant to the requested role
                    continue;
                }
            }

            // Re-analyze resume against provided JD to compute fresh matchScore
            const analysis = analyzeResume(s.resumeText, jobDescription);
            const score = typeof analysis.matchScore === 'number' ? analysis.matchScore : 0;

            // If requiredAts is provided, skip those below threshold
            const minAts = Number(requiredAts) || 0;
            if (minAts > 0 && score < minAts) continue;

            const userId = s.userId ? String(s.userId._id || s.userId) : 'unknown:' + (s._id || '');
            const userEmail = s.userId ? s.userId.email : null;

            const existing = bestByUser.get(userId);
            if (!existing || score > existing.score) {
                bestByUser.set(userId, {
                    userId,
                    email: userEmail || 'unknown',
                    score,
                    resumeFileName: s.resumeFileName || '',
                    scanId: s._id
                });
            }
        }

        // Convert map to array and sort by descending score
        const results = Array.from(bestByUser.values()).sort((a, b) => b.score - a.score);

        return res.json({ results, count: results.length });
    } catch (error) {
        console.error('Error in scanAll:', error);
        return res.status(500).json({ msg: 'Server error while performing bulk scan' });
    }
};
