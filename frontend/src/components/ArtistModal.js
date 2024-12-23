import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistModal({
  artist,
  relatedArtists,
  shows,
  loading,
  error,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex flex-col space-y-3 justify-center items-center py-8">
        <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-800" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-black">
      <h2 className="text-2xl font-bold mb-4">
        Related Artists for {artist.name}
      </h2>
      {relatedArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {relatedArtists.map((relatedArtist) => (
            <div
              key={relatedArtist.id}
              className="border border-gray-200 bg-black p-4 rounded-lg shadow-lg transition-all hover:shadow-2xl hover:scale-105 transform hover:bg-gray-800 duration-300 ease-in-out"
            >
              <h3 className="text-lg font-semibold text-white">
                {relatedArtist.name}
              </h3>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6">No related artists found.</p>
      )}

      <h2 className="text-2xl font-bold mb-4">
        Upcoming Shows for {artist.name}
      </h2>
      {shows.length > 0 ? (
        <div className="space-y-4">
          {shows.map((show) => (
            <div
              key={show.id}
              className="border border-gray-200 bg-black p-4 rounded-lg shadow-lg transition-all hover:shadow-2xl hover:scale-105 transform hover:bg-gray-800 duration-300 ease-in-out flex items-center"
            >
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">
                  {show.name}
                </h3>
                <p>{formatDate(show.dates?.start?.localDate)}</p>
                {show._embedded &&
                  show._embedded.venues[0] &&
                  show._embedded.venues[0].city && (
                    <p>
                      {show._embedded.venues[0].name},{" "}
                      {show._embedded.venues[0].city.name}
                    </p>
                  )}
                <a
                  href={show.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Buy Tickets
                </a>
              </div>
              {show.images.length > 0 && (
                <img
                  src={show.images[0].url}
                  alt={show.name}
                  className="w-1/3 h-1/3 object-cover rounded-md ml-4"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming shows found.</p>
      )}
    </div>
  );
}
