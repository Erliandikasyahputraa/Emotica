import asyncHandler from 'express-async-handler';
import Analysis from '../models/Analysis.js';

// @desc    Analyze text sentiment
// @route   POST /api/v1/analysis/analyze
// @access  Private
export const analyzeText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Please provide text to analyze');
  }

  // This is a simple sentiment analysis implementation
  // In a real application, you would use a proper NLP library
  const sentimentScore = analyzeSentiment(text);
  const sentimentType = getSentimentType(sentimentScore);

  // Extract keywords (simplified)
  const keywords = extractKeywords(text);
  
  // Create analysis record
  const analysis = await Analysis.create({
    user: req.user.id,
    text,
    sentiment: {
      type: sentimentType,
      score: sentimentScore,
    },
    keywords: keywords.map(keyword => ({
      text: keyword,
      relevance: Math.random(), // Simplified relevance score
    })),
  });

  res.status(201).json({
    success: true,
    data: analysis,
  });
});

// @desc    Get analysis history
// @route   GET /api/v1/analysis/history
// @access  Private
export const getAnalysisHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    Analysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Analysis.countDocuments({ user: req.user.id }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    count: analyses.length,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
    },
    data: analyses,
  });
});

// @desc    Get analysis stats
// @route   GET /api/v1/analysis/stats
// @access  Private
export const getAnalysisStats = asyncHandler(async (req, res) => {
  const stats = await Analysis.getSentimentStats(req.user.id);
  
  res.json({
    success: true,
    data: stats,
  });
});

// Helper function to analyze sentiment (simplified)
function analyzeSentiment(text) {
  // This is a very basic implementation
  // In a real app, use a proper NLP library
  const positiveWords = ['happy', 'good', 'great', 'awesome', 'love'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'awful'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  // Normalize score between -1 and 1
  return Math.max(-1, Math.min(1, score / 5));
}

// Helper function to get sentiment type
function getSentimentType(score) {
  if (score > 0.3) return 'positive';
  if (score < -0.3) return 'negative';
  return 'neutral';
}

// Helper function to extract keywords (simplified)
function extractKeywords(text) {
  // In a real app, use a proper NLP library
  const commonWords = ['the', 'and', 'is', 'in', 'it', 'to', 'of', 'for', 'with', 'on', 'at', 'by'];
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = {};
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
