import stevePoster from "@/assets/images/Steve-2025/poster.jpg";
import uploadPoster from "@/assets/images/Upload-2020/poster.jpg";
import happyGilmorePoster from "@/assets/images/Happy Gilmore 2-2025/poster.jpg";
import theManInMyBasementPoster from "@/assets/images/The Man in My Basement-2025/poster.jpg";

import happyGilmoreImage1 from "@/assets/images/Happy Gilmore 2-2025/1.jpg";
import steveImage1 from "@/assets/images/Steve-2025/1.jpg";
import steveImage2 from "@/assets/images/Steve-2025/2.jpg";
import steveImage3 from "@/assets/images/Steve-2025/3.jpg";
import steveImage4 from "@/assets/images/Steve-2025/4.jpg";
import steveImage5 from "@/assets/images/Steve-2025/5.jpg";
import steveImage6 from "@/assets/images/Steve-2025/6.jpg";
import steveImage7 from "@/assets/images/Steve-2025/7.jpg";
import theManInMyBasementImage1 from "@/assets/images/The Man in My Basement-2025/1.jpg";
import theManInMyBasementImage2 from "@/assets/images/The Man in My Basement-2025/2.jpg";
import theManInMyBasementImage3 from "@/assets/images/The Man in My Basement-2025/3.jpg";
import uploadImage1 from "@/assets/images/Upload-2020/1.jpg";

export const happyGilmoreImages = [happyGilmoreImage1];

export const uploadImages = [uploadImage1];

export const theManInMyBasementImages = [
  theManInMyBasementImage1,
  theManInMyBasementImage2,
  theManInMyBasementImage3,
];
export const steveImages = [
  steveImage1,
  steveImage2,
  steveImage3,
  steveImage4,
  steveImage5,
  steveImage6,
  steveImage7,
];

export const allPosters = [
  stevePoster,
  uploadPoster,
  happyGilmorePoster,
  theManInMyBasementPoster,
];

export {
  stevePoster,
  uploadPoster,
  happyGilmorePoster,
  theManInMyBasementPoster,
};

export const mockDb = [
  {
    id: "steve",
    poster: stevePoster,
    images: steveImages,
    title: "Steve 2020",
    description: "A thrilling adventure with Steve.",
    trailerDuration: "2:01",
  },
  {
    id: "upload",
    poster: uploadPoster,
    images: uploadImages,
    title: "Upload 2020",
    description: "A story about uploading memories.",
    trailerDuration: "1:45",
  },
  {
    id: "happyGilmore",
    poster: happyGilmorePoster,
    images: happyGilmoreImages,
    title: "Happy Gilmore 2",
    description: "A sequel to the beloved classic.",
    trailerDuration: "2:30",
  },
  {
    id: "theManInMyBasement",
    poster: theManInMyBasementPoster,
    images: theManInMyBasementImages,
    title: "The Man in My Basement 2025",
    description: "A gripping tale of suspense.",
    trailerDuration: "3:12",
  },
];
