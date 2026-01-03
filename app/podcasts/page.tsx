"use client"

import { useState } from "react"

interface Video {
  id: string
  title: string
  duration: string
  videoId: string
}

// To get YouTube video IDs:
// 1. Go to your YouTube video
// 2. Copy the video ID from the URL (e.g., youtube.com/watch?v=VIDEO_ID_HERE)
// 3. Or use YouTube Data API to fetch all videos from the channel
const toolThinkerAIPodcasts: Video[] = [
  {
    id: "1",
    title: "LEAN PRODUCTION",
    duration: "33:44",
    videoId: "Qe7mReNHqA0"
  },
  {
    id: "2",
    title: "CAREER PATH IN FRAMEWORK THINKING",
    duration: "25:31",
    videoId: "d9LyjIjfL1s"
  },
  {
    id: "3",
    title: "AI IS TRANSFORMING THE WAY WE USE FRAMEWORKS FOR DECISION-MAKING",
    duration: "16:37",
    videoId: "44wOirNE1Ik"
  },
  {
    id: "4",
    title: "SWOT ANALYSIS: A COMPREHENSIVE GUIDE TO STRATEGIC ASSESSMENT",
    duration: "10:41",
    videoId: "e2KHHB_AF3s"
  },
  {
    id: "5",
    title: "THE EVOLUTION OF THOUGHT: CURRENT WAY OF THINKING VS. FRAMEWORK THINKING",
    duration: "15:31",
    videoId: "YJYvh0oSEaw"
  },
  {
    id: "6",
    title: "ARE YOU SOMEONE ELSES SYSTEM INPUT?",
    duration: "",
    videoId: "mIF0SUFhexY"
  },
  {
    id: "7",
    title: "STARTUP GROWTH HACKS - LAUNCH, FUND & SCALE FAST",
    duration: "1:15:29",
    videoId: "_exWoXHawnw"
  },
  {
    id: "8",
    title: "Tool Thinker Podcast",
    duration: "",
    videoId: "ArjISNKHXxc"
  }
]

const startSmartPodcasts: Video[] = [
  // Add START SMART podcasts here when available
]

const foundersLogPodcasts: Video[] = [
  {
    id: "fl1",
    title: "Founder's Log Episode 1",
    duration: "",
    videoId: "z6FLDxFN4yo"
  },
  {
    id: "fl2",
    title: "Founder's Log Episode 2",
    duration: "",
    videoId: "Tt5njn4_pJg"
  },
  {
    id: "fl3",
    title: "Founder's Log Episode 3",
    duration: "",
    videoId: "IXKykxWMoFY"
  },
  {
    id: "fl4",
    title: "Founder's Log Episode 4",
    duration: "",
    videoId: "_FK1ofbcfYw"
  },
  {
    id: "fl5",
    title: "Founder's Log Episode 5",
    duration: "",
    videoId: "sFeWv-MFuNw"
  },
  {
    id: "fl6",
    title: "Founder's Log Episode 6",
    duration: "",
    videoId: "jRQ-6qVvaYw"
  }
]

// Helper function to get YouTube thumbnail URL
function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) return ""
  // Use mqdefault for medium quality (320x180) - good for thumbnails
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function PodcastsPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video>(foundersLogPodcasts[0])
  const [activeCategory, setActiveCategory] = useState<"ai" | "founders-log">("founders-log")

  const currentVideos = 
    activeCategory === "ai" ? toolThinkerAIPodcasts : foundersLogPodcasts

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tool Thinker Podcasts</h1>
          <a
            href="https://www.youtube.com/@ToolThinker/podcasts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            View on YouTube →
          </a>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveCategory("founders-log")
              setSelectedVideo(foundersLogPodcasts[0])
            }}
            className={`px-4 py-2 font-semibold ${
              activeCategory === "founders-log"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Founder's Log
          </button>
          <button
            onClick={() => {
              setActiveCategory("ai")
              setSelectedVideo(toolThinkerAIPodcasts[0])
            }}
            className={`px-4 py-2 font-semibold ${
              activeCategory === "ai"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tool Thinker AI Podcasts
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeCategory === "founders-log" ? "Founder's Log" : "Tool Thinker AI Podcasts"}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {currentVideos.length} {currentVideos.length === 1 ? "Video" : "Videos"}
              </p>
              
              <div className="space-y-3">
                {currentVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedVideo.id === video.id
                        ? "bg-gray-100 border-2 border-gray-900"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Video Thumbnail */}
                      <div className="flex-shrink-0 w-32 h-20 bg-gray-200 rounded overflow-hidden relative group">
                        {video.videoId ? (
                          <>
                            <img
                              src={getYouTubeThumbnail(video.videoId)}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if thumbnail fails to load
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                        {selectedVideo.id === video.id && (
                          <div className="absolute inset-0 border-2 border-gray-900" />
                        )}
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {video.title}
                        </h3>
                        {video.duration && (
                          <p className="text-xs text-gray-500">{video.duration}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Main Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Video Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                    TT
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {selectedVideo.title}
                    </h3>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-gray-900">
                {selectedVideo.videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <p className="text-lg font-semibold mb-2">{selectedVideo.title}</p>
                      <p className="text-sm opacity-75 mb-4">
                        Add YouTube video ID to display video
                      </p>
                      <a
                        href="https://www.youtube.com/@ToolThinker/podcasts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                {selectedVideo.duration && (
                  <p className="text-gray-600 text-sm mb-4">Duration: {selectedVideo.duration}</p>
                )}
                <a
                  href="https://www.youtube.com/@ToolThinker/podcasts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
