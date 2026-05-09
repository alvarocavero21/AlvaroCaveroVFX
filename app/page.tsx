import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SnapScrollContainer from "@/components/SnapScrollContainer";

// Code-split each section into its own async chunk
const Hero     = dynamic(() => import("@/components/Hero"));
const Showreel = dynamic(() => import("@/components/Showreel"));
const Projects = dynamic(() => import("@/components/Projects"));
const Contact  = dynamic(() => import("@/components/Contact"));

export default function Home() {
  return (
    <>
      <Navbar />
      <SnapScrollContainer>
        <Hero />
        <Showreel />
        <Projects />
        <Contact />
      </SnapScrollContainer>
    </>
  );
}
