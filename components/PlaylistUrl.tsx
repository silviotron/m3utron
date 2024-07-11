"use client";
type PlaylistUrl = {
  id?: String;
};

export default function PlaylistUrl({ id = "" }: PlaylistUrl) {
  return <div>{`${window.location.href}//m3u?id=${id}`}</div>;
}
