// src/models/video.model.js

import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate"

const videoSchema = new mongoose.Schema({

  // Kis user ne upload kiya
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Video ki basic info
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  // Original video — jo user ne upload ki
  originalUrl: {
    type: String,
    required: true
  },

  // Cloudinary ka public ID — delete/update ke liye zaroori
  cloudinaryPublicId: {
    type: String,
    required: true
  },

  // Alag alag qualities ki URLs
  qualities: {
    '360p':  { type: String, default: null },
    '720p':  { type: String, default: null },
    '1080p': { type: String, default: null }
  },

  // Thumbnail — video ka preview image
  thumbnail: {
    type: String,
    default: null
  },

  // Video ki details
  duration:  { type: Number, default: 0 },  // seconds mein
  size:      { type: Number, default: 0 },  // bytes mein
  format:    { type: String, default: 'mp4' },

  // Processing status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading'
  },

  // Stats
  views: {
    type: Number,
    default: 0
  },

  isPublic: {
    type: Boolean,
    default: true
  }

}, { timestamps: true }); // createdAt, updatedAt auto milega


videoSchema.plugin(mongooseAggregatePaginate) 
export const Video = mongoose.model('Video', videoSchema);
