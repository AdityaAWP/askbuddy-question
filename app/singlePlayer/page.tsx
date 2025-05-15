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

  const fetchQuestions = async (categoryId?: string) => {
    setLoading(true);
    setError(null); 
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

      setQuestions(data || []);
    } catch (error) {
      console.error(error);
      setError("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
      setQuestions([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    const selectedCategoryId = filters.categories[0];  
    fetchQuestions(selectedCategoryId);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="p-6">
      <CategoryList onFilterChange={handleFilterChange} />
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Daftar Questions</h2>

        {loading && <p>Loading...</p>}

        {error && <p className="text-red-500">{error}</p>}

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
