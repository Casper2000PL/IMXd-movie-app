import { celebsDB } from "@/lib/images-data";
import CelebCard from "../celeb-card";

const CelebritiesSection = () => {
  const celeb1 = celebsDB[0];

  return (
    <section className="flex w-full flex-col gap-5 border-2 border-white p-10">
      <CelebCard name={celeb1.name} image={celeb1.image} />
    </section>
  );
};

export default CelebritiesSection;
