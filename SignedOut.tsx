import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignedOut() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the sign-off message from sessionStorage
    const storedMessage = sessionStorage.getItem("signedOutMessage");
    if (storedMessage) {
      setMessage(storedMessage);
      // Clear it so it doesn't show again on refresh
      sessionStorage.removeItem("signedOutMessage");
    } else {
      // Fallback message if none stored
      setMessage("You've been signed out. See you soon! 👋");
    }

    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-gray-900">Signed Out</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{message}</p>
          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
              size="lg"
            >
              Sign Back In
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Go to Home
            </Button>
          </div>
          <p className="text-sm text-gray-500 pt-2">
            Redirecting to login in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
