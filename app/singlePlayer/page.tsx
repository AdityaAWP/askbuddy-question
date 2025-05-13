"use client";

import { useEffect, useState } from "react";
import CategoryList, { FilterState } from "@/components/category-list";

interface Question {
  id: string;
  text: string;
  created_by: string;
  category_id: string;
}

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data pertanyaan
  const fetchQuestions = async (categoryId?: string) => {
    setLoading(true);
    setError(null); // Reset error sebelum mencoba fetch data
    let url = "/api/questions";
    if (categoryId) {
      url += `?category_id=${categoryId}`;
    }
    console.log("Fetching questions from:", url);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch questions: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Fetched questions:", data);

      // Update state dengan data yang diterima
      setQuestions(data || []); // Pastikan data sudah dalam format array
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
      setQuestions([]); // Set data ke array kosong jika terjadi error
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani perubahan filter kategori
  const handleFilterChange = (filters: FilterState) => {
    const selectedCategoryId = filters.categories[0];  // Ambil kategori pertama yang dipilih
    fetchQuestions(selectedCategoryId); // Fetch berdasarkan kategori yang dipilih
  };

  // Mengambil data pertanyaan pertama kali saat komponen dimuat
  useEffect(() => {
    fetchQuestions(); // Fetch semua data untuk tampilan awal
  }, []);

  return (
    <div className="p-6">
      <CategoryList onFilterChange={handleFilterChange} />
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Daftar Questions</h2>

        {/* Menampilkan loading state */}
        {loading && <p>Loading...</p>}

        {/* Menampilkan error jika ada */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Tabel data */}
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Text</th>
              <th className="px-4 py-2 border">Created By</th>
              <th className="px-4 py-2 border">Category ID</th>
            </tr>
          </thead>
          <tbody>
            {questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-2 border">{q.id}</td>
                  <td className="px-4 py-2 border">{q.text}</td>
                  <td className="px-4 py-2 border">{q.created_by}</td>
                  <td className="px-4 py-2 border">{q.category_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan={4}>
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
