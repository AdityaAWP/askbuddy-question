import Image from "next/image"

const Footer = () => {
    return (
          
  <footer className="bg-[#f2efde] text-black py-12">
              <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                          <div className="flex items-center space-x-2 mb-4">
                          <Image src="/images/logo.png" alt="AskBuddy" width={40} height={40} className="object-contain" />
                          <span className="font-bold text-xl">AskBuddy</span>
                          </div>
                          <p className="text-black">Talk Better, Connect Deeper.</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-lg mb-4">Features</h3>
                          <ul className="space-y-2">
                              <li><a href="#" className="text-black hover:text-black transition">Multiplayer</a></li>
                              <li><a href="#" className="text-black hover:text-black transition">Single Player</a></li>
                              <li><a href="#" className="text-black hover:text-black transition">Rizzler</a></li>
                          </ul>
                      </div>
  
                      <div>
                          <h3 className="font-semibold text-lg mb-4">Contact</h3>
                          <ul className="space-y-2">
                              <li className="flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                  </svg>
                                  <a href="mailto:info@AskBuddy.com" className="text-black hover:text-white transition">info@AskBuddy.com</a>
                              </li>
                              <li className="flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                  </svg>
                                  <a href="tel:+1234567890" className="text-black hover:text-white transition">+1 (234) 567-890</a>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div className="border-t border-gray-700 mt-8 pt-8 text-center text-black">
                      <p>© 2025 AskBuddy. All rights reserved.</p>
                  </div>
              </div>
          </footer>
    )
  }
  
  export default Footer
  