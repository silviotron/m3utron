import { Button } from "@/components/ui/button";
import Timer from "@/components/timer";
import Tags from "@/components/tags";
import { IoPersonOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";

interface InfoProps {
  user: any;
  stream: any;
  channel: any;
  className?: string;
}

export default function Video({ user, stream, channel, className }: InfoProps) {
  return (
    <div className={className ? className : "flex gap-4 mt-2"}>
      <img
        src={user.profile_image_url}
        alt=""
        className="rounded-full size-20 my-auto   border-4 border-[#9146FF] p-1"
      />
      <div className="w-full overflow-hidden">
        <div className="flex flex-wrap justify-between md:flex-nowrap">
          <h1 className="text-xl flex">
            {user.display_name}
            {user.broadcaster_type == "partner" && (
              <RiVerifiedBadgeFill color="#9146FF" className="h-full ml-1 " size={15} />
            )}
          </h1>
          <div className="flex items-center space-x-2">
            {stream && (
              <>
                <span className="text-[#ff8280] flex items-center space-x-1">
                  <IoPersonOutline className="h-6" />
                  <span>{stream.viewer_count}</span>
                </span>
                <Timer start={stream.started_at} />
              </>
            )}
            <Button
              className="bg-[#9146FF] hover:bg-[#772ce8] h-7"
              size="sm"
              variant="outline"
            >
              <FaRegHeart className="mr-1" />
              Follow
            </Button>
          </div>
        </div>

        <div className="mt-1 ">
          <h2>{stream?.title || channel?.title}</h2>
        </div>

        <div className="mt-1 flex w-full flex-wrap md:flex-nowrap ">
          <a
            href={`/directory/all/tags/${
              stream ? stream.game_name.replaceAll(" ", "-") : channel.game_name
            }`}
            className="text-[#9146FF] whitespace-nowrap hover:underline mb-2 mr-4 "
          >
            {stream?.game_name || channel.game_name}
          </a>
          {stream && stream.tags.length > 0 && (
            <div className="w-full mb-2">
              <Tags tags={stream.tags} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
