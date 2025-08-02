"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getArtistConnection } from "@/lib/api";

export default function ArtistConnectionPage() {
  const [startArtist, setStartArtist] = useState("");
  const [endArtist, setEndArtist] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.profile.accessToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await getArtistConnection(startArtist, endArtist, token);
      setResult(data);
    } catch (err) {
      setResult({ error: "Request failed" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">6 Degrees of Artist</h1>
      <p className="text-gray-600 mb-6 text-center">
        Discover how two artists are connected through their musical collaborations
      </p>
      
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Start Artist (e.g., Future)"
          value={startArtist}
          onChange={(e) => setStartArtist(e.target.value)}
          required
        />
        <input
          className="flex-1 border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="End Artist (e.g., Frank Ocean)"
          value={endArtist}
          onChange={(e) => setEndArtist(e.target.value)}
          required
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Connection"}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          {result.connections ? (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Connection Found! ({result.pathLength} degrees)
              </h2>
              
              <div className="space-y-4">
                {result.connections.map((connection, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{connection.from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-800">{connection.to}</span>
                      </div>
                      {connection.track && (
                        <div className="text-sm text-gray-600 mt-1">
                          via <span className="italic">{connection.track}</span>
                          {connection.album && (
                            <span> on <span className="font-medium">{connection.album}</span></span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Step {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  🎵 {startArtist} and {endArtist} are connected through {result.pathLength} collaboration(s)!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="text-red-600 font-medium">
                ❌ {result.error || "No connection found between these artists"}
              </div>
              <p className="text-red-500 text-sm mt-2">
                Try different artists or make sure both artists exist in our database.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
