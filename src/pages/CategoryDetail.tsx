import React from "react";
import { useParams } from "react-router-dom";
import data from "../data/evaluationData.json";

const CategoryDetails = () => {
  const { categoryName } = useParams();

  const selectedCategory = data.evaluationCategories.find(
    (c) => c.category === decodeURIComponent(categoryName!)
  );

  if (!selectedCategory) {
    return <p>No Subcategories Found</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">{selectedCategory.category}</h2>

      <ul className="space-y-3 mt-4">
        {selectedCategory.subCategories.map((item, index) => (
          <li key={index} className="p-3 border rounded-lg bg-white">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryDetails;
