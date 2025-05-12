"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="container md:mx-14 md:rounded-2xl md:mt-5 flex bg-[#f2efde] z-20 items-center fixed justify-between md:py-5 py-2 px-4 md:px-8 ">
        <div className="w-24">
          <Link href='/'>
          <Image src="/images/logo.png" alt="POSSE" width={40} height={40} className="object-contain" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-6">
            <Link href="/create-room" className="hover:text-gray-600 transition-colors">
              <h1>Create Room</h1>
            </Link>
            <Link href="/solo" className="hover:text-gray-600 transition-colors">
              <h1>Solo Mode</h1>
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              <h1>Instruction</h1>
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-black" aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-[#f2efde] z-10 flex flex-col pt-20 px-6 transition-transform duration-300 ease-in-out md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="flex flex-col space-y-6 text-lg font-medium">
          <Link
            href="#"
            className="py-2 border-b border-gray-200 hover:text-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Create Room
          </Link>
          <Link
            href="#"
            className="py-2 border-b border-gray-200 hover:text-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Solo Mode
          </Link>
          <Link
            href="#"
            className="py-2 border-b border-gray-200 hover:text-gray-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Instruction
          </Link>
        </nav>
      </div>
    </>
  )
}

export default Header
