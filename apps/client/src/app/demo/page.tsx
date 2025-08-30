"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Upload, Users, ArrowLeft, Monitor, Mic, Camera, Share2 } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [activeTab, setActiveTab] = useState("video");

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteUnmute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">SyncWave Pro Demo</h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            🔴 Live Demo
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Demo Player Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Interactive Demo Player
                  </CardTitle>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab("video")}
                      className={`px-3 py-1 rounded text-sm ${
                        activeTab === "video" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      Video
                    </button>
                    <button
                      onClick={() => setActiveTab("audio")}
                      className={`px-3 py-1 rounded text-sm ${
                        activeTab === "audio" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      Audio
                    </button>
                    <button
                      onClick={() => setActiveTab("screen")}
                      className={`px-3 py-1 rounded text-sm ${
                        activeTab === "screen" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      Screen Share
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Video Player Area */}
                <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {activeTab === "video" && (
                      <div className="text-center text-white">
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">HD Video Stream</p>
                        <p className="text-sm opacity-75">1080p • 60fps • Adaptive Bitrate</p>
                      </div>
                    )}
                    {activeTab === "audio" && (
                      <div className="text-center text-white">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-8 bg-primary rounded animate-pulse`}
                              style={{ 
                                animationDelay: `${i * 100}ms`,
                                height: `${Math.random() * 40 + 10}px`
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-lg mb-2">Audio Waveform</p>
                        <p className="text-sm opacity-75">High Quality • Real-time Processing</p>
                      </div>
                    )}
                    {activeTab === "screen" && (
                      <div className="text-center text-white">
                        <Share2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Screen Sharing</p>
                        <p className="text-sm opacity-75">WebRTC • Full HD • Low Latency</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handlePlayPause}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMuteUnmute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {isMuted ? 0 : volume}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ● LIVE
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {isPlaying ? "Playing" : "Paused"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Showcase */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    File Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop your files here
                    </p>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Supports: MP4, MP3, AVI, MOV, WAV
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Room Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "You", status: "Host", mic: true, camera: true },
                      { name: "Alice Cooper", status: "Presenter", mic: true, camera: false },
                      { name: "Bob Johnson", status: "Viewer", mic: false, camera: false },
                      { name: "Carol Smith", status: "Viewer", mic: false, camera: true },
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                            {user.name[0]}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mic className={`h-3 w-3 ${user.mic ? "text-green-600" : "text-muted-foreground"}`} />
                          <Camera className={`h-3 w-3 ${user.camera ? "text-green-600" : "text-muted-foreground"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brave Browser Optimized</CardTitle>
                <CardDescription>
                  Built for privacy-focused browsing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Ad Blocker Compatible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Privacy Shield Friendly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">WebRTC Optimized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Cross-Platform Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Video Quality</span>
                      <span>1080p</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[90%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Audio Quality</span>
                      <span>320kbps</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-[95%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Connection</span>
                      <span>Excellent</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[100%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Latency</span>
                      <span>12ms</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" asChild>
                  <Link href="/rooms">
                    <Users className="h-4 w-4 mr-2" />
                    Join a Room
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/auth/register">
                    <Play className="h-4 w-4 mr-2" />
                    Start Streaming
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Screen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
