// import Image from "next/image";
import SearchStory from "@/components/component/searchStory"

const Home = () => {
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

export default Home;