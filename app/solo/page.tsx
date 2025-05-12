'use client'

import Footer from '@/components/footer';
import Header from '@/components/header';
import React, { useState } from 'react';

type Category = 'pdkt' | 'pertemanan' | 'keluarga' | 'profesional' | 'kencan' | 'hiburan';

interface TopicsByCategory {
  pdkt: string[];
  pertemanan: string[];
  keluarga: string[];
  profesional: string[];
  kencan: string[];
  hiburan: string[];
}

const AskBuddy: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<Category | ''>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('');

  const topicsByCategory: TopicsByCategory = {
    pdkt: [
      "Apa film favorit kamu? Kenapa kamu menyukainya?",
      "Tempat mana yang paling ingin kamu kunjungi suatu hari nanti?",
      "Apa hobi yang paling kamu nikmati di waktu luang?",
      "Musik atau artis apa yang sering kamu dengarkan akhir-akhir ini?",
      "Apa makanan favoritmu? Ada rekomendasi tempat makan yang enak?",
      "Bagaimana cerita di balik nama kamu?",
      "Apa hal terkonyol yang pernah kamu lakukan waktu kecil?",
      "Kalau kamu bisa memiliki satu kekuatan super, apa yang akan kamu pilih?",
      "Apa pencapaian yang paling kamu banggakan selama ini?",
      "Apa hal yang paling membuatmu tertawa?"
    ],
    pertemanan: [
      "Apa acara TV atau series yang sedang kamu tonton sekarang?",
      "Apa rencana liburanmu berikutnya?",
      "Ceritakan pengalaman lucu yang pernah kamu alami bersama teman!",
      "Game apa yang sedang kamu mainkan akhir-akhir ini?",
      "Apa rekomendasi podcast menarik yang pernah kamu dengar?",
      "Kalau kamu bisa bertemu dengan satu tokoh terkenal, siapa yang akan kamu pilih?",
      "Apa hal paling spontan yang pernah kamu lakukan?",
      "Apa mimpi aneh yang pernah kamu alami dan masih kamu ingat sampai sekarang?",
      "Apa tantangan terbesar yang sedang kamu hadapi saat ini?",
      "Apa kebiasaan unik yang kamu miliki yang mungkin tidak diketahui banyak orang?"
    ],
    keluarga: [
      "Apa kenangan masa kecil paling berkesan bersama keluarga?",
      "Tradisi keluarga apa yang paling kamu sukai?",
      "Siapa anggota keluarga yang paling menginspirasimu dan kenapa?",
      "Apa pelajaran terpenting yang kamu dapatkan dari orangtuamu?",
      "Bagaimana pendapatmu tentang acara keluarga yang terakhir kita adakan?",
      "Apa resep masakan keluarga yang paling kamu sukai?",
      "Apa hal yang ingin kamu wujudkan untuk keluarga kita di masa depan?",
      "Ceritakan momen lucu yang pernah terjadi dalam keluarga kita!",
      "Apa nilai-nilai keluarga yang ingin kamu teruskan ke generasi berikutnya?",
      "Bagaimana cara kita bisa menghabiskan lebih banyak waktu berkualitas bersama?"
    ],
    profesional: [
      "Apa proyek menarik yang sedang kamu kerjakan saat ini?",
      "Bagaimana kamu mengatasi tantangan di tempat kerja?",
      "Apa skill baru yang ingin kamu pelajari untuk pengembangan karir?",
      "Siapa tokoh profesional yang paling kamu kagumi dan kenapa?",
      "Apa pendapatmu tentang tren industri terbaru di bidang kita?",
      "Bagaimana kamu menyeimbangkan kehidupan kerja dan pribadi?",
      "Apa pencapaian profesional yang paling kamu banggakan?",
      "Apa saran terbaik yang pernah kamu dapatkan dari mentor atau rekan kerja?",
      "Bagaimana visi karirmu dalam 5 tahun ke depan?",
      "Apa perubahan positif yang ingin kamu lihat di tempat kerja atau industri kita?"
    ],
    kencan: [
      "Apa momen paling romantis yang pernah kamu alami?",
      "Bagaimana kencan ideal menurutmu?",
      "Apa hal kecil yang bisa membuat harimu lebih baik?",
      "Apa impian terbesarmu yang ingin kamu wujudkan suatu hari nanti?",
      "Apa nilai-nilai yang paling penting bagimu dalam sebuah hubungan?",
      "Ceritakan tentang perjalanan paling berkesan yang pernah kamu lakukan!",
      "Apa hal yang membuatmu merasa dicintai dan dihargai?",
      "Bagaimana cara kamu mengungkapkan rasa sayang kepada orang yang kamu cintai?",
      "Apa aktivitas yang ingin kamu coba bersama pasangan?",
      "Apa hal yang membuatmu tertarik pada seseorang secara emosional?"
    ],
    hiburan: [
      "Film apa yang menurutmu paling underrated dan layak ditonton?",
      "Apa konser atau festival musik terbaik yang pernah kamu hadiri?",
      "Siapa karakter fiksi yang paling kamu kagumi dan kenapa?",
      "Apa buku terbaik yang pernah kamu baca tahun ini?",
      "Apa channel YouTube atau content creator favoritmu saat ini?",
      "Jika kamu bisa masuk ke dunia film atau serial TV mana pun, apa pilihanmu?",
      "Apa game yang menurutmu memiliki cerita paling menarik?",
      "Apa lagu yang selalu bisa memperbaiki mood-mu?",
      "Apa tren hiburan terkini yang menurutmu paling menarik?",
      "Jika kamu bisa bertemu dengan satu selebriti, siapa yang akan kamu pilih?"
    ]
  };

  const categoryColors: { [key in Category]: string } = {
    pdkt: 'from-pink-500 to-rose-500',
    pertemanan: 'from-blue-500 to-indigo-500',
    keluarga: 'from-green-500 to-emerald-500',
    profesional: 'from-amber-500 to-orange-500',
    kencan: 'from-purple-500 to-violet-500',
    hiburan: 'from-cyan-500 to-teal-500'
  };

  const categoryTitles: { [key in Category]: string } = {
    pdkt: 'Topik PDKT',
    pertemanan: 'Topik Pertemanan',
    keluarga: 'Topik Keluarga',
    profesional: 'Topik Profesional',
    kencan: 'Topik Kencan',
    hiburan: 'Topik Hiburan'
  };

  const openTopicGenerator = (category: Category) => {
    setCurrentCategory(category);
    setShowModal(true);
    generateTopic();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const generateTopic = () => {
    if (currentCategory) {
      const topics = topicsByCategory[currentCategory];
      const randomIndex = Math.floor(Math.random() * topics.length);
      setTopic(topics[randomIndex]);
    }
  };

  const copyTopic = () => {
    if (topic) {
      navigator.clipboard.writeText(topic).then(() => {
        alert('Topik berhasil disalin!');
      });
    }
  };

  // Check if currentCategory is a valid category
  const currentCategoryColor = currentCategory ? categoryColors[currentCategory] : '';

  return (
    <div className="min-h-screen bg-[#004647]  flex flex-col">
      {/* Header */}
      <Header/>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-28">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Pilih Kategori Topik Pembicaraan</h2>
          <p className="text-white max-w-2xl mx-auto">Kesulitan mencari topik saat nongkrong? askBuddy hadir untuk membantu kamu menemukan topik pembicaraan yang menarik berdasarkan situasi yang kamu hadapi.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['pdkt', 'pertemanan', 'keluarga', 'profesional', 'kencan', 'hiburan'] as Category[]).map((category) => (
            <div key={category} className="category-card bg-white rounded-xl overflow-hidden shadow-md">
              <div className={`h-32 bg-gradient-to-r ${categoryColors[category]} flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* SVG Icons based on category */}
                  {category === 'pdkt' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>}
                  {category === 'pertemanan' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>}
                  {category === 'keluarga' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>}
                  {category === 'profesional' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>}
                  {category === 'kencan' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
                  {category === 'hiburan' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>}
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{categoryTitles[category]}</h3>
                <p className="text-gray-600 mb-4">Topik untuk kategori {categoryTitles[category].split(' ')[1].toLowerCase()}.</p>
                <button onClick={() => openTopicGenerator(category)} className="w-full py-2 bg-gradient-to-r text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                  Pilih Kategori
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div id="topicModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div id="modalHeader" className={`p-6 text-white bg-gradient-to-r ${currentCategoryColor}`}>
              <div className="flex justify-between items-center">
                <h3 id="modalTitle" className="text-xl font-bold">{categoryTitles[currentCategory as Category]}</h3>
                <button onClick={closeModal} className="focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div id="topicContainer" className="bg-gray-100 rounded-lg p-4 mb-6 min-h-[100px] flex items-center justify-center">
                <p id="topicText" className="text-center text-lg font-medium">{topic}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={generateTopic} className="flex-grow py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  Topik Baru
                </button>
                <button onClick={copyTopic} className="py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  Salin Topik
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default AskBuddy;
