import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Please add some text to analyze'],
    },
    sentiment: {
      type: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        required: true,
      },
      score: {
        type: Number,
        required: true,
        min: -1,
        max: 1,
      },
    },
    keywords: [
      {
        text: String,
        relevance: Number,
      },
    ],
    entities: [
      {
        type: String,
        relevance: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
analysisSchema.index({ text: 'text' });

// Static method to get sentiment stats
analysisSchema.statics.getSentimentStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: '$sentiment.type',
        count: { $sum: 1 },
        avgScore: { $avg: '$sentiment.score' },
      },
    },
  ]);

  return stats;
};

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
