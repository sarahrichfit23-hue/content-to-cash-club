import React, { useEffect } from "react";

export default function StripeSuccess() { 
  useEffect(() => { 
    const t = setTimeout(() => { 
      window.location.href = "/login"; 
    }, 5000); 
    return () => clearTimeout(t); 
  }, []);

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"></div>
<div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-4"></div>
Success! 🎉<h1 className="text-2xl font-semibold">Success! 🎉</h1>
<p className="text-gray-700"></p>
   Your free trial has started. Check your email for your login link and instructions. Your free trial has started. Check your email for your login link and instructions.
   </p>
   <p className="text-sm text-gray-500">
  Didn’t receive an email? Check your spam folder, or try signing in from the login page using your email.
   </p></p>
<a href="/login" className="inline-block px-4 py-2 rounded-md bg-gray-900 text-white"></a>
Go to Login
</a>
</div>
</div>
);
}