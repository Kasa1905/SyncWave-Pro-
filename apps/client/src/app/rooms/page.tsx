"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Users, Plus, Search, Video, Music, Lock, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Room {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  userCount: number;
  maxUsers: number;
  type: "video" | "audio" | "mixed";
  createdAt: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    isPrivate: false,
    type: "mixed" as const,
    maxUsers: 10,
  });

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockRooms: Room[] = [
          {
            id: "1",
            name: "Tech Talk Tuesday",
            description: "Weekly tech discussions and presentations",
            isPrivate: false,
            userCount: 7,
            maxUsers: 20,
            type: "video",
            createdAt: "2024-01-15T10:00:00Z"
          },
          {
            id: "2",
            name: "Music Jam Session",
            description: "Live music collaboration and streaming",
            isPrivate: false,
            userCount: 3,
            maxUsers: 8,
            type: "audio",
            createdAt: "2024-01-15T14:30:00Z"
          },
          {
            id: "3",
            name: "Private Team Meeting",
            description: "Confidential project discussion",
            isPrivate: true,
            userCount: 5,
            maxUsers: 10,
            type: "mixed",
            createdAt: "2024-01-15T16:00:00Z"
          }
        ];
        
        setRooms(mockRooms);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to create room
      console.log("Creating room:", newRoom);
      
      // Mock room creation
      const createdRoom: Room = {
        id: Date.now().toString(),
        ...newRoom,
        userCount: 1,
        createdAt: new Date().toISOString()
      };
      
      setRooms(prev => [createdRoom, ...prev]);
      setNewRoom({
        name: "",
        description: "",
        isPrivate: false,
        type: "mixed",
        maxUsers: 10,
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const getRoomTypeIcon = (type: Room["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getRoomTypeBadge = (type: Room["type"]) => {
    const variants = {
      video: "bg-blue-100 text-blue-800",
      audio: "bg-green-100 text-green-800",
      mixed: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge variant="secondary" className={variants[type]}>
        {getRoomTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
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
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Rooms</h1>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Set up a new streaming room for collaboration
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter room name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomDescription">Description</Label>
                  <Input
                    id="roomDescription"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your room"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min="2"
                    max="100"
                    value={newRoom.maxUsers}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isPrivate">Private Room</Label>
                </div>
                <Button type="submit" className="w-full">
                  Create Room
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading rooms...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {room.isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                        {room.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {room.description}
                      </CardDescription>
                    </div>
                    {getRoomTypeBadge(room.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {room.userCount}/{room.maxUsers} users
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(room.userCount / room.maxUsers) * 100}%` }}
                      />
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/rooms/${room.id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Join Room
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredRooms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Be the first to create a room!"}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Set up a new streaming room for collaboration
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter room name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomDescription">Description</Label>
                    <Input
                      id="roomDescription"
                      value={newRoom.description}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your room"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Room
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
}
