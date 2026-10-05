const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 }
  },
  { timestamps: true }
)

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    published: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    comments: [commentSchema]
  },
  { timestamps: true }
)

postSchema.index({ title: 'text', content: 'text' })

module.exports = mongoose.model('Post', postSchema)
