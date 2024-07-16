import dayjs from "dayjs"; // Utilizaremos dayjs para manejar fechas y tiempos
import { FaCircle } from "react-icons/fa6";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type Stream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags: string[];
  is_mature: boolean;
};

type FollowedProps = {
  data?: Stream[];
};

export default function Followed({ data = [] }: FollowedProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((stream) => {
        // Eliminar "-{width}x{height}" de thumbnail_url para obtener tamaño máximo
        const thumbnailUrl = stream.thumbnail_url.replace(/-{width}x{height}/, "");

        return (
          <div key={stream.id} className="  overflow-hidden shadow-lg">
            <a
              target="_blank"
              href={`https://twitch-m3u8-api.vercel.app/?s=${stream.user_login}`}
            >
              <img
                src={thumbnailUrl}
                alt={`${stream.user_name} stream thumbnail`}
                className="w-full h-48 object-cover"
              />
            </a>
            <div className="p-2">
              <h2 title={stream.title} className="text-base font-bold mb-2 line-clamp-2">
                {stream.title}
              </h2>
              <div className="flex justify-between text-sm mb-2">
                <p className="overflow-hidden whitespace-nowrap overflow-ellipsis w-1/2">
                  {stream.user_name}
                </p>
                <p className="text-gray-500 overflow-hidden whitespace-nowrap overflow-ellipsis w-1/2 text-end text-sm">
                  {stream.game_name}
                </p>
              </div>

              <div className="flex items-center text-sm mb-2 justify-between">
                <div className="flex items-center">
                  <a href={`https://www.twitch.tv/popout/${stream.user_login}/chat`}>
                    <span className="w-4 h-4 mr-1">
                      <FaCircle color="#6441a5" />
                    </span>
                  </a>

                  <span className="w-4 h-4 mr-1">
                    <FaCircle color="red" />
                  </span>
                  <span>{stream.viewer_count}</span>
                </div>
                <span className="ml-auto">
                  {dayjs().diff(dayjs(stream.started_at), "hours")}h{" "}
                  {dayjs().diff(dayjs(stream.started_at), "minutes") % 60}m
                </span>
              </div>
              <Carousel
                opts={{
                  loop: true,
                  dragFree: false,
                  skipSnaps: true,
                }}
              >
                <CarouselContent className="select-none ml-0">
                  {stream.tags.map((tag, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-auto  bg-gray-200 text-gray-700 px-2 py-1 text-xs font-semibold rounded-full m-2"
                    >
                      {tag}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        );
      })}
    </div>
  );
}
