type image = {
  id: string;
  contentId: string | null;
  fileUrl: string;
  type: "image" | "video";
  mediaCategory:
    | "poster"
    | "gallery_image"
    | "trailer"
    | "clip"
    | "profile_image";
  title: string | null;
  fileSize: number | null;
  key: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ImageGalleryProps = {
  images: image[];
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="mt-5 w-full">
      <div className="flex w-full flex-col gap-4">
        {/* first div row */}
        <div className="flex w-full gap-4">
          {/* first 3 images */}
          {images.slice(0, 3).map((image) => (
            <div
              key={image.id}
              className="max-h-41 min-h-22 min-w-0 flex-1 overflow-hidden"
            >
              <img
                src={image.fileUrl}
                alt={image.title || "Image"}
                className="h-full w-full rounded-md object-cover object-top"
              />
            </div>
          ))}
        </div>
        {/* second div row */}
        <div className="flex w-full gap-4">
          <div className="flex flex-8 gap-4">
            {images.slice(3, 6).map((image) => (
              <div
                key={image.id}
                className="max-h-41 min-h-22 min-w-0 flex-1 overflow-hidden"
              >
                <img
                  src={image.fileUrl}
                  alt={image.title || "Image"}
                  className="h-full w-full rounded-md object-cover object-top"
                />
              </div>
            ))}
          </div>
          <div className="relative hidden flex-1 sm:flex">
            {images.length > 6 && (
              <>
                <img
                  src={images[6].fileUrl}
                  alt={images[6].title || "Image"}
                  className="h-full w-full rounded-md object-cover object-top"
                />
                <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-md bg-black/50">
                  <p className="font-roboto font-semibold text-white">
                    +&nbsp;{images.length - 6}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/*
styles:
div 1st row:
max-height: 162.5px;
min-height: 87.5px


img:
object-fit: cover;
object-position: top;

--ipt-gutter: 0.75rem;
*/

export default ImageGallery;
