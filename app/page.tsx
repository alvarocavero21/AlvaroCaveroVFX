import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SnapScrollContainer from "@/components/SnapScrollContainer";

// Section order: 0=Hero, 1=Showreel, 2=Projects, 3=Contact — must match SnapScrollContainer SECTIONS
const Hero     = dynamic(() => import("@/components/Hero"),     { loading: () => null });
const Showreel = dynamic(() => import("@/components/Showreel"), { loading: () => null });
const Projects = dynamic(() => import("@/components/Projects"), { loading: () => null });
const Contact  = dynamic(() => import("@/components/Contact"),  { loading: () => null });

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
