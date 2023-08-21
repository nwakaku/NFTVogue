import Mint from "../components/Mint";

export default function CreatePage() {
  return (
    <div className="flex flex-col gap-4 items-center pb-8">
      <div className="mb-4 text-xl">
        <p className="font-semibold">Inspiration · Couture · Showcase · Commerce</p>
      </div>
      <Mint />
    </div>
  );
}
