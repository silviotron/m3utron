import HlsPlayer from "./hlsPlayer";

interface VideoProps {
  user: any;
  stream: any;
}

export default function Video({ user, stream }: VideoProps) {
  return (
    <>
      {stream ? (
        <HlsPlayer
          src={`https://twitch-m3u8-api.vercel.app/p?s=${user.login}`}
          poster={stream.thumbnail_url.replace(/-{width}x{height}/, "")}
        />
      ) : (
        <div className="relative">
          {user.offline_image_url != "" ? (
            <img src={user.offline_image_url} alt="s" className="w-full h-auto" />
          ) : (
            <div className="w-full bg-black aspect-video" />
          )}
          <span className="absolute top-4 right-6 bg-black bg-opacity-75 text-white px-1 py-0 text-sm">
            OFFLINE
          </span>
        </div>
      )}
    </>
  );
}
