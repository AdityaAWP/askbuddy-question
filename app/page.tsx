
import Footer from "@/components/footer";
import Header from "@/components/header";
import RoomsLanding from "@/components/rooms-landing";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import hero from '../public/images/hero.png'
import soloImage from '../public/images/solo.jpeg'

export default function HomePage() {
  return (
    <div>
       <main className="min-h-screen bg-[#004647]">
      {/* Header */}
      <Header/>
      {/* Hero Section */}
      <section
        className="bg-red-100 bg-center bg-cover min-h-[100vh]"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)),url(${hero.src})` }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className=" -mt-28 h-screen mb-4"></div>
          <p className="text-white text-xl md:text-3xl font-medium tracking-wide text-center">
            Talk Better, Connect Deeper !!
          </p>
        </div>
      </section>
      <section>
        <RoomsLanding/>
      </section>
      <section
        className="mx-4 md:mx-10 mb-16 md:mb-32 min-h-[50vh] md:min-h-[70vh] flex items-center flex-col justify-center rounded-2xl gap-8 md:gap-20 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.75)), url(${soloImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-center font-black px-4 md:px-8 max-w-[90%] md:max-w-[75%]">
          Lets Us To Give You A Question
        </h1>
        <Link href="/solo">
        <Button
          size="lg"
          className="bg-[#f2efde] hover:bg-white text-black px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-full"
        >
          Get The Question
        </Button>
        </Link>
      </section>

      {/* About Section */}
      <section className="container mx-auto mb-32 px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#f2efde] p-4 md:p-6 rounded-3xl">
            <div className="inline-block bg-white text-black px-4 py-1 rounded-full text-sm font-medium mb-4 md:mb-6">
              PDKT
            </div>
            <h2 className="text-black text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 md:mb-6">
              ASK BUDDY
              <br />
              HELP YOU
              <br />
              RIZZ
              <br />
              YOUR CRUSH
            </h2>
            <p className="text-black text-base md:text-lg mb-4">
             Not sure what to talk about with my crush, let us help!
            </p>
          </div>
          <div className="hidden md:block relative w-full rounded-3xl overflow-hidden">
            <Image
              src="/images/couple.png"
              alt="Two people talking and smiling"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
      </section>
      <Footer/>
    </main>
    </div>
  )
}