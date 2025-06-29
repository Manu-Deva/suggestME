"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Import framer-motion
import {
  getUserFavorites,
  getRelatedArtists,
  getNextShows,
} from "../../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ArtistModal from "@/components/ArtistModal";
import Link from "next/link";
import Image from "next/image";

export default function Favorites() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profileData = useSelector((state) => state.profile.profile);
  const token = useSelector((state) => state.profile.accessToken);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [shows, setShows] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (!token) {
          alert("No access token! Ensure you're authenticated.");
          dispatch(clearProfile());
          router.push("/get-started");
        }
        const data = await getUserFavorites(token);
        setFavorites(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleArtistSelect = async (artist) => {
    setSelectedArtist(artist);
    setModalLoading(true);
    setModalError(null);
    try {
	  console.log("AUth token: ", token);
      const relatedData = await getRelatedArtists(artist.id, token);

      if (Array.isArray(relatedData)) {
        setRelatedArtists(relatedData.slice(0, 5));
      } else {
        console.error(
          "Unexpected data structure for related artists:",
          relatedData
        );
        setRelatedArtists([]);
      }

      const showsData = await getNextShows(artist.name);
      setShows(showsData ? showsData.events : []);
    } catch (err) {
      console.error("Error fetching artist data:", err);
      setModalError(`Failed to fetch data: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col space-y-3 justify-center items-center py-8">
        <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-500" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Top Artists</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="w-full max-w-lg bg-white text-black overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={artist.images[0]?.url}
                    alt={artist.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-black ">
                    {artist.name}
                  </h2>
                  <p className="text-sm text-black mt-1">
                    {artist.genres.join(", ")}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleArtistSelect(artist)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        More Info
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-black">
                      <DialogHeader>
                        <DialogTitle>{artist.name}</DialogTitle>
                      </DialogHeader>
                      <ArtistModal
                        artist={artist}
                        relatedArtists={relatedArtists}
                        shows={shows}
                        loading={modalLoading}
                        error={modalError}
                      />
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
