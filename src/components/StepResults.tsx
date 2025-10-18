import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";
console.log("Card", Card);
console.log("CardHeader", CardHeader);
console.log("CardTitle", CardTitle);
console.log("CardDescription", CardDescription);
console.log("CardContent", CardContent);
console.log("Tabs", Tabs);
console.log("TabsList", TabsList);
console.log("TabsTrigger", TabsTrigger);
console.log("TabsContent", TabsContent);
console.log("Button", Button);

const goalEducation: Record<string, string> = {
  fat_loss: "This plan helps you lose fat by controlling calories and balancing macros.",
  muscle_gain: "This plan helps you build muscle with higher protein and balanced carbs.",
  maintenance: "This plan helps you maintain your weight with optimal nutrition.",
};

const StepResults = React.memo(function StepResults({ plan, setStep, client, nutrition }) {
  const resultsRef = useRef<HTMLDivElement>(null);
console.log("Card", Card);
console.log("CardHeader", CardHeader);
console.log("CardTitle", CardTitle);
console.log("CardDescription", CardDescription);
console.log("CardContent", CardContent);
console.log("Tabs", Tabs);
console.log("TabsList", TabsList);
console.log("TabsTrigger", TabsTrigger);
console.log("TabsContent", TabsContent);
console.log("Button", Button);
  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm print:max-w-full print:p-0">
      <CardHeader>
        <CardTitle>Your AI Meal Plan</CardTitle>
        <CardDescription>
          Here's your customized meal plan, recipe pack, and shopping list. Download or print this as a PDF!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={resultsRef}>
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-50 border-l-4 border-yellow-400">
            <h3 className="font-bold text-lg mb-2">
              How This Plan Helps You Reach Your Goal
            </h3>
            <p className="text-gray-700">
              {goalEducation?.[client.goal] ?? ""}
            </p>
            <ul className="mt-3 text-sm text-gray-600">
              <li>
                <span className="font-semibold">Calories:</span> {nutrition.kcal || "N/A"} kcal/day
              </li>
              <li>
                <span className="font-semibold">Macros:</span> Protein {nutrition.protein}%, Carbs {nutrition.carbs}%, Fat {nutrition.fat}%
              </li>
            </ul>
          </div>
          {!plan ? (
            <p className="text-gray-500">No plan generated yet.</p>
          ) : (
            <>
              <Tabs defaultValue="plan">
                <TabsList className="mb-4">
                  <TabsTrigger value="plan">🗓 Plan</TabsTrigger>
                  <TabsTrigger value="shopping">🛒 Shopping</TabsTrigger>
                  <TabsTrigger value="recipes">📖 Recipes</TabsTrigger>
                  <TabsTrigger value="summary">💬 Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="plan">
                  {plan.days_plan.map((day, i) => (
                    <div key={i} className="mb-4 border rounded-lg p-4 bg-gray-50 print:bg-white print:border-none">
                      <h3 className="font-semibold mb-2">{day.date || `Day ${i + 1}`}</h3>
                      <ul className="space-y-1 text-sm">
                        {day.meals?.map((m, j) => (
                          <li key={j}>
                            <strong>{m.meal_type}:</strong> {m.title} ({m.kcal} kcal)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="shopping">
                  <ul className="space-y-1 text-sm">
                    {plan.shopping_list?.map((item, i) => (
                      <li key={i}>{item.qty} {item.unit} {item.item}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="recipes">
                  {plan.recipes?.map((r, i) => (
                    <div key={i} className="mb-4 border rounded-lg p-4 bg-gray-50 print:bg-white print:border-none">
                      <h3 className="font-semibold mb-2">{r.title}</h3>
                      <p className="text-sm font-medium">Ingredients:</p>
                      <ul className="text-sm list-disc ml-5 mb-2">
                        {r.ingredients.map((ing, j) => (
                          <li key={j}>{ing}</li>
                        ))}
                      </ul>
                      <p className="text-sm font-medium">Instructions:</p>
                      <p className="text-sm">{r.instructions}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="summary">
                  <p className="text-sm leading-relaxed">{plan.summary}</p>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
        <div className="flex gap-4 mt-6 print:hidden">
          <ReactToPrint
            trigger={() => (
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                📄 Download / Print PDF
              </Button>
            )}
            content={() => resultsRef.current}
            documentTitle={`Meal Plan for ${client.name || "Client"}`}
          />
          <Button variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setStep(1)}>
            🔁 Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default StepResults;