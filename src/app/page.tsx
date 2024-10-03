// import Image from "next/image";
import SearchStory from "@/components/component/searchStory"

export default function Home() {
  return (
    <div
      style={{
        backgroundImage: "url('/polkadot-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <SearchStory />
    </div>
  )
}