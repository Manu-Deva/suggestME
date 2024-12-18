"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Search,
  Play,
  SkipForward,
  Heart,
  Ticket,
  UserRound,
  Clock,
  BarChart2,
  Headphones,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const profileData = useSelector((state) => state.profile.profile); // Access the profile data
  console.log("profileData", profileData);
  const trackData = useSelector((state) => state.profile.trackData);
  const playlists = useSelector((state) => state.profile.playlists);
  const isAuthenticated = useSelector((state) => state.profile.isAuthenticated); // Access the auth status
  const profileState = useSelector((state) => state.profile);
  console.log("profileState", profileState);
  const [activeTab, setActiveTab] = useState("discover");

  const [expandedPlaylist, setExpandedPlaylist] = useState(null);

  const togglePlaylist = (playlistId) => {
    setExpandedPlaylist(expandedPlaylist === playlistId ? null : playlistId);
  };

  useEffect(() => {
    console.log("Profile Data Updated:", profileData);
    console.log("Track Data Updated:", trackData);
  }, [profileData, trackData]);

  const recentlyPlayed = [
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      cover: "/placeholder.svg?height=40&width=40",
    },
    {
      title: "Shape of You",
      artist: "Ed Sheeran",
      cover: "/placeholder.svg?height=40&width=40",
    },
    {
      title: "Dance Monkey",
      artist: "Tones and I",
      cover: "/placeholder.svg?height=40&width=40",
    },
  ];

  const topGenres = [
    { name: "Pop", percentage: 40 },
    { name: "Rock", percentage: 30 },
    { name: "Hip Hop", percentage: 20 },
    { name: "Electronic", percentage: 10 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex items-center space-x-10">
          <Link className="flex items-center justify-center" href="/">
            <span className="ml-2 text-2xl font-bold">SuggestMe</span>
          </Link>
          <nav className="hidden md:flex space-x-10">
            <Link
              href="/"
              className="hover:text-gray-300 text-sm font-medium hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-gray-300 text-sm font-medium hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <form className="relative">
            <Input
              className="pl-8"
              placeholder="Search for songs, artists..."
              type="search"
            />
          </form>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Notifications</span>
            <svg
              className=" h-5 w-5"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </Button>
          {profileData && profileData.images ? (
            <span className="flex flex-row items-center space-x-4 text-sm font-medium">
              <img
                src={profileData.images[0].url}
                alt="Profile"
                className="w-10 h-10 rounded-full mt-2"
              />
            </span>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">
            Welcome back, {profileData.display_name}!
          </h1>
          <Tabs
            defaultValue={activeTab}
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="library">Your Library</TabsTrigger>
              {/* <TabsTrigger value="stats">Stats</TabsTrigger> */}
            </TabsList>
            <TabsContent value="discover" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">
                    Your Favorite Tracks
                  </CardTitle>
                  <CardDescription>
                    Based on your recent listening
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-flow-col justify-auto md:auto-cols-auto gap-2">
                    {trackData.map((trackItem, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center max-w-48"
                      >
                        <Image
                          src={trackItem.album.images[0].url}
                          alt={trackItem.name}
                          width={125}
                          height={125}
                          className="rounded-md mb-2"
                        />
                        <p className="font-semibold">{trackItem.name}</p>
                        <p className="text-sm text-gray-500">
                          {trackItem.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </p>
                        {/* <Button variant="ghost" size="icon" className="mt-2">
                          <Play className="h-4 w-4" />
                          <span className="sr-only">Play {trackItem.name}</span>
                        </Button> */}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <Button className="w-full justify-start" asChildren>
                      <UserRound className="mr-2 h-4 w-4" />
                      <Link href="/favorites">View Favorite Artists</Link>
                    </Button>
                    <Button className="w-full justify-start">
                      <Ticket className="mr-2 h-4 w-4" />
                      <Link href="/artist-shows">Find Upcoming Shows</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {/* <p>Discover more music!</p> */}
                    <Button className="w-full justify-start">
                      <Link href="/recs">Get Genre-Based Recommendations</Link>
                    </Button>
                    <Button className="w-full justify-start">
                      <Link href="/weather">
                        Get Weather-Based Recommendations
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Discover Weekly</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Your personalized playlist is ready. Discover new tracks
                      every Monday!
                    </p>
                    <Button className="mt-4">Listen Now</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="library" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Recently Played</h3>
                      <ul className="space-y-4">
                        {recentlyPlayed.map((song, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle>
                                <div className="flex items-center gap-3 p-2">
                                  <Image
                                    src={song.cover}
                                    alt={`${song.title} cover`}
                                    width={40}
                                    height={40}
                                    className="rounded-sm"
                                  />
                                  <div className="flex-grow">
                                    <p className="font-medium">{song.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {song.artist}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => togglePlaylist(song.title)}
                                  >
                                    {expandedPlaylist === song.title ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <AnimatePresence>
                              {expandedPlaylist === song.title && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <CardContent>
                                    <ScrollArea className="h-[200px] border-t">
                                      {trackData.map((track, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ x: -20, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{
                                            duration: 0.3,
                                            delay: index * 0.1,
                                          }}
                                          className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                                        >
                                          <div>
                                            <div className="font-medium">
                                              {track.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {track.artists
                                                .map((artist) => artist.name)
                                                .join(", ")}
                                            </div>
                                          </div>
                                          <Button size="icon" variant="ghost">
                                            <Play className="h-4 w-4" />
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </ScrollArea>
                                  </CardContent>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Card>
                        ))}
                      </ul>
                    </div>
                    {/* <div>
                      <h3 className="font-semibold mb-2">Recently Played</h3>
                      <ul className="space-y-4">
                        {recentlyPlayed.map((song, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle>
                                <div className="flex items-center gap-3 p-2">
                                  <Image
                                    src={song.cover}
                                    alt={`${song.title} cover`}
                                    width={40}
                                    height={40}
                                    className="rounded-sm"
                                  />
                                  <div className="flex-grow">
                                    <p className="font-medium">{song.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {song.artist}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => togglePlaylist(song.title)}
                                  >
                                    {expandedPlaylist === song.title ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <Collapsible open={expandedPlaylist === song.title}>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => togglePlaylist(song.title)}
                                >
                                  {expandedPlaylist === song.title ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent>
                                  {trackData.map((track, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                      }}
                                      className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {track.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {track.artists
                                            .map((artist) => artist.name)
                                            .join(", ")}
                                        </div>
                                      </div>
                                      <Button size="icon" variant="ghost">
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </CardContent>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        ))}
                      </ul>
                    </div> */}
                    <div>
                      <h3 className="font-semibold mb-2">Your Playlists</h3>
                      <ul className="space-y-2">
                        {playlists.map((playlist, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Image
                              src={playlist.image}
                              alt={`${playlists[0].id} cover`}
                              width={40}
                              height={40}
                              className="rounded-sm"
                            />
                            <div>
                              <p className="font-medium">{playlist.genre}</p>
                              <p className="text-sm text-gray-500">
                                Generic Artist
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto"
                            >
                              <Play className="h-4 w-4" />
                              <span className="sr-only">
                                Play this playlist
                              </span>
                            </Button>
                          </li>
                        ))}
                        {/* <li className="flex items-center gap-2">
                          <Image
                            src={playlists[0].image}
                            alt={`${playlists[0].id} cover`}
                            width={40}
                            height={40}
                            className="rounded-sm"
                          />
                          <p className="font-medium">Summer Vibes 2023</p>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <Music className="mr-2 h-4 w-4" />
                            Workout Mix
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <Music className="mr-2 h-4 w-4" />
                            Chill Evenings
                          </Button>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Listening Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Top Genres</h3>
                      <ul className="space-y-2">
                        {topGenres.map((genre, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="font-medium">{genre.name}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${genre.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {genre.percentage}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Listening Time</h3>
                      <div className="flex items-center gap-4">
                        <Headphones className="h-12 w-12 text-primary" />
                        <div>
                          <p className="text-3xl font-bold">23h 45m</p>
                          <p className="text-sm text-gray-500">This week</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Listening History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <BarChart2 className="h-full w-full text-gray-300" />
                    <p className="text-center mt-2 text-sm text-gray-500">
                      Placeholder for actual chart
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 px-4 md:px-6 border-t">
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <SkipForward className="h-4 w-4" />
              <span className="sr-only">Skip</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Play className="h-4 w-4" />
              <span className="sr-only">Play</span>
            </Button>
            <div>
              <p className="font-medium">Currently Playing</p>
              <p className="text-sm text-gray-500">Artist - Song Title</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Like</span>
            </Button>
            <div className="w-48 h-1 bg-gray-200 rounded-full">
              <div className="w-1/3 h-1 bg-primary rounded-full"></div>
            </div>
          </div>
        </div> */}
      </footer>
    </div>
  );
}
