"use client";
type PlaylistUrl = {
  id?: String;
};

export default function PlaylistUrl({ id = "" }: PlaylistUrl) {
  let url = `${window.location.href}m3u?id=${id}`;
  return (
    <div className="flex justify-center mb-4">
      <a className="hover:text-blue-400" href={url}>
        {url}
      </a>
    </div>
  );
}
