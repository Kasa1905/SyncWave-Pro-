"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Users, Upload, Share2, Shield, Monitor, Video, Music } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    window.location.href = `/room/${newRoomId}`;
  };

  const joinRoom = () => {
    if (roomCode.trim()) {
      window.location.href = `/room/${roomCode}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">SyncWave Pro</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button onClick={createRoom}>
              Create Room
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Stream Together, Instantly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Create rooms instantly. Upload your media. Stream in perfect sync with friends and colleagues.
            No accounts needed - just start streaming!
          </p>
          
          {/* Quick Room Actions */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
            <div className="flex flex-1">
              <Input
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                className="rounded-r-none"
              />
              <Button onClick={joinRoom} className="rounded-l-none">
                Join
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" onClick={createRoom} className="w-full sm:w-auto">
              <Play className="mr-2 h-5 w-5" />
              Create New Room
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/demo">
                <Monitor className="mr-2 h-5 w-5" />
                Try Demo
              </Link>
            </Button>
          </div>
          
          {/* Browser Compatibility */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>✓ Chrome</span>
            <span>✓ Firefox</span>
            <span>✓ Brave</span>
            <span>✓ Safari</span>
            <span>✓ Edge</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stream Like Never Before</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade streaming platform for seamless collaboration
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Video className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Ultra-HD Video</CardTitle>
              <CardDescription>
                Stream MP4 videos in stunning quality with HLS adaptive bitrate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adaptive streaming</li>
                <li>• Multiple resolutions</li>
                <li>• Smooth playback</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Music className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Crystal Audio</CardTitle>
              <CardDescription>
                Perfect audio sync across all participants with drift correction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Perfect sync</li>
                <li>• High quality</li>
                <li>• Low latency</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Instant Rooms</CardTitle>
              <CardDescription>
                Create or join rooms instantly - no registration required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No account needed</li>
                <li>• Share room links</li>
                <li>• Quick access</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="h-8 w-8 text-primary mb-2" />
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Drag & drop file uploads with automatic transcoding and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multiple formats</li>
                <li>• Auto transcoding</li>
                <li>• Cloud storage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Share2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Screen Sharing</CardTitle>
              <CardDescription>
                WebRTC-powered screen sharing for presentations and demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full screen</li>
                <li>• App sharing</li>
                <li>• HD quality</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Built for privacy-focused browsers with secure connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTTPS/WSS encryption</li>
                <li>• No data tracking</li>
                <li>• Brave optimized</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Browser Compatibility Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50 rounded-lg my-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Brave Browser Optimized</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Built specifically for privacy-focused browsers. Works flawlessly with ad blockers, 
            enhanced privacy settings, and WebRTC features.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 bg-background rounded-lg">
              <span className="font-semibold">Chrome</span>
              <span className="text-green-500">✓ Full Support</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-background rounded-lg">
              <span className="font-semibold">Firefox</span>
              <span className="text-green-500">✓ Full Support</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-background rounded-lg border-2 border-primary">
              <span className="font-semibold">Brave</span>
              <span className="text-green-500">✓ Optimized</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-background rounded-lg">
              <span className="font-semibold">Safari</span>
              <span className="text-green-500">✓ Supported</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-background rounded-lg">
              <span className="font-semibold">Edge</span>
              <span className="text-green-500">✓ Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 SyncWave Pro. Built for seamless streaming experiences.</p>
        </div>
      </footer>
    </div>
  );
}
