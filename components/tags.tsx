import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

interface TagsProps {
  tags: any;
  className?: string;
}

export default function Tags({ tags, className }: TagsProps) {
  return (
    <Carousel
      opts={{
        loop: true,
        dragFree: false,
        skipSnaps: true,
      }}
      className={`ml-0 w-full max-w-full overflow-hidden text-nowrap whitespace-nowrap translate-y-1 ${className}`}
    >
      <CarouselContent className="select-none ml-0  ">
        {tags.map((tag: string, index: number) => (
          <a href={`/directory/category/${tag}`} key={index} className="select-none ">
            <CarouselItem className="basis-auto   bg-[#53535f] text-[#adadb8] px-2 py-[2px] text-xs font-semibold rounded-full mx-1 my-auto hover:opacity-80 max-w-full overflow-hidden text-nowrap whitespace-nowrap ">
              {tag}
            </CarouselItem>
          </a>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
