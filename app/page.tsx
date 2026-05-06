import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import SnapScrollContainer from "@/components/SnapScrollContainer";

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
