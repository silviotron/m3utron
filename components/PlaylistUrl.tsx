type PlaylistUrl = {
  id?: String;
};

export default function PlaylistUrl({ id = "" }: PlaylistUrl) {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const url = `${window.location.href}/m3u?id=${id}`;

  return (
    <div className="flex justify-center mb-4">
      <a className="hover:text-blue-400" href={url}>
        {url}
      </a>
    </div>
  );
}
