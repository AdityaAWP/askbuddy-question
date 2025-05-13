'use client'
import { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface Category {
  id: string;  // UUID
  name: string;
}

interface Question {
  id: string;
  text: string;
}

const AskBuddy: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories from the Supabase API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Unexpected API response:", data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch questions for the selected category
  const fetchQuestionsForCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/questions?category_id=${categoryId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        console.error("Unexpected API response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const openTopicGenerator = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setShowModal(true);
    fetchQuestionsForCategory(categoryId); // Fetch questions when opening the modal
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const generateTopic = (categoryId: string) => {
    if (questions.length > 0) {
      // Select a random question from the fetched questions
      const randomIndex = Math.floor(Math.random() * questions.length);
      setTopic(questions[randomIndex].text);
    } else {
      setTopic("No questions available for this category.");
    }
  };

  const copyTopic = () => {
    if (topic) {
      navigator.clipboard.writeText(topic).then(() => {
        alert("Topik berhasil disalin!");
      });
    }
  };

  // Color mapping based on category
  const categoryColors: { [key: string]: string } = {
    pdkt: "from-pink-500 to-rose-500",
    pertemanan: "from-blue-500 to-indigo-500",
    keluarga: "from-green-500 to-emerald-500",
    profesional: "from-amber-500 to-orange-500",
    pacaran: "from-purple-500 to-violet-500",
    hiburan: "from-cyan-500 to-teal-500",
  };

  // SVG Icons for each category
  const categoryIcons: { [key: string]: React.ReactNode } = {
    pdkt: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
    ),
    pertemanan: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
    keluarga: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    profesional: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
    pacaran: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
    hiburan: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
    ),
  };

  return (
    <div className="min-h-screen bg-[#004647] flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-28">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-white">Pilih Kategori Topik Pembicaraan</h2>
          <p className="text-white max-w-2xl mx-auto">
            Kesulitan mencari topik saat nongkrong? askBuddy hadir untuk membantu kamu menemukan topik pembicaraan yang menarik berdasarkan situasi yang kamu hadapi.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryColor = categoryColors[category.name.toLowerCase()] || "from-gray-500 to-gray-600"; // Default color if category is not found
            const categoryIcon = categoryIcons[category.name.toLowerCase()] || <></>;

            return (
              <div key={category.id} className="category-card bg-white rounded-xl overflow-hidden shadow-md">
                <div className={`h-32 bg-gradient-to-r ${categoryColor} flex items-center justify-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {categoryIcon}
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">Topik untuk kategori {category.name.toLowerCase()}.</p>
                  <button
                    onClick={() => openTopicGenerator(category.id)}
                    className="w-full py-2 bg-gradient-to-r text-red-500 font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Pilih Kategori
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div id="topicModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-white bg-gradient-to-r from-indigo-500 to-blue-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Topik Kategori</h3>
                <button onClick={closeModal} className="focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-4 mb-6 min-h-[100px] flex items-center justify-center">
                <p className="text-center text-lg font-medium">{topic}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => generateTopic(currentCategory!)} className="flex-grow py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
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

      <Footer />
    </div>
  );
};

export default AskBuddy;
