import React from "react";

export default function DaysMealPlan({ days_plan }) {
  if (!Array.isArray(days_plan) || days_plan.length === 0) {
    return <div className="text-gray-400">No meal plan days found yet.</div>;
  }
  return (
    <div>
      {days_plan.map((day, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="mb-1 text-base font-semibold text-gray-900">{day?.date || `Day ${day.day || idx + 1}`}</h3>
          <table className="w-full border-collapse mb-2 text-sm">
            <thead>
              <tr className="bg-yellow-100">
                <th className="py-2 px-3 border-b border-gold-200">Meal</th>
                <th className="py-2 px-3 border-b border-gold-200">Dish</th>
                {/* <th className="py-2 px-3 border-b border-gold-200">Calories</th> */}
              </tr>
            </thead>
            <tbody>
              {["breakfast", "lunch", "dinner", "snack"].map(mealType => (
                day[mealType] ? (
                  <tr key={mealType}>
                    <td className="py-2 px-3 border-b border-gray-100">
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </td>
                    <td className="py-2 px-3 border-b border-gray-100">{day[mealType]}</td>
                    {/* <td className="py-2 px-3 border-b border-gray-100">{/* If you have calories */}</td> */}
                  </tr>
                ) : null
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}