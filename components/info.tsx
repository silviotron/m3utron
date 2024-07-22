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
          <h1 className="flex text-sm xl:text-xl  h-full xl:h-auto flex items-center text-center">
            {user.display_name}
            {user.broadcaster_type == "partner" && (
              <RiVerifiedBadgeFill
                color="#9146FF"
                className="h-full ml-1 size-3 xl:size-4"
              />
            )}
          </h1>
          <div className="flex items-center space-x-2 ">
            {stream && (
              <>
                <span className="text-[#ff8280] flex items-center space-x-1 text-sm xl:text-base">
                  <IoPersonOutline className="h-full" />
                  <span>{stream.viewer_count}</span>
                </span>
                <Timer start={stream.started_at} className="text-xs xl:text-base" />
              </>
            )}
            <Button
              className="bg-[#9146FF] hover:bg-[#772ce8] h-6 xl:h-7 px-1 xl:px-2"
              size="sm"
              variant="outline"
            >
              <FaRegHeart className="xl:mr-1" />
              <span className="hidden xl:inline">Follow</span>
            </Button>
          </div>
        </div>

        <div className="mt-1 text-xs xl:text-base">
          <h2>{stream?.title || channel?.title}</h2>
        </div>

        <div className="mt-1 flex w-full flex-wrap md:flex-nowrap ">
          <a
            href={`/directory/all/tags/${
              stream ? stream.game_name.replaceAll(" ", "-") : channel.game_name
            }`}
            className="text-[#9146FF] whitespace-nowrap hover:underline mb-2 mr-4 text-xs xl:text-base"
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
