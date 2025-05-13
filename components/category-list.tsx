import * as React from "react";
import { useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  id: string;  // UUID
  name: string;
}

interface CategoryListProps {
  className?: string;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
}

export default function CategoryList({
  className,
  onFilterChange,
}: CategoryListProps) {
  const [filters, setFilters] = useState<FilterState>({ categories: [] });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

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

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    setActiveFiltersCount(updated.categories.length);
    onFilterChange?.(updated);
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    const current = filters[type];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [type]: newValues });
  };

  const clearFilters = () => {
    setFilters({ categories: [] });
    setActiveFiltersCount(0);
    onFilterChange?.({ categories: [] });
  };

  const handleNewCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Error creating category:", data.error);
      } else {
        setCategories((prev) => [...prev, data]);
        setNewCategory("");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const ActiveFilterBadges = () => {
    return filters.categories.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-3">
        {filters.categories.map((catId, i) => {
          const category = categories.find((c) => c.id === catId);
          return (
            <Badge
              key={`cat-${catId}-${i}`}
              variant="outline"
              className="flex items-center gap-1 px-2 py-1"
            >
              {category?.name || catId}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => toggleFilter("categories", catId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={clearFilters}
        >
          Clear all
        </Button>
      </div>
    ) : null;
  };

  return (
    <div className={cn("w-full p-6", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Category
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start w-full font-normal",
                      filters.categories.includes(cat.id) && "font-medium"
                    )}
                    onClick={() => toggleFilter("categories", cat.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      {cat.name}
                      {filters.categories.includes(cat.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterBadges />

      {/* New Category POST Form */}
      <form onSubmit={handleNewCategorySubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border p-2 rounded"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}
