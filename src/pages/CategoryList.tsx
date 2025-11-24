import React from "react";
import { useNavigate } from "react-router-dom";
import data from "../data/evaluationData.json";
import { Layers, ChevronRight } from "lucide-react"; // Modern icons

const CategoryList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Evaluation Categories
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.evaluationCategories.map((cat, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(`/categories/${encodeURIComponent(cat.category)}`)
              }
              className="
                bg-white shadow-md rounded-2xl p-5 cursor-pointer 
                border border-transparent
                transition-all duration-300
                hover:shadow-lg hover:border-blue-400
                group
              "
            >
              <div className="flex items-start justify-between">
                {/* Icon */}
                <Layers className="w-8 h-8 text-blue-600 group-hover:scale-110 transition" />
                {/* Arrow */}
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>

              {/* Text */}
              <p className="mt-4 font-semibold text-lg text-gray-800">
                {cat.category}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {cat.subCategories.length} Sub Items
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
