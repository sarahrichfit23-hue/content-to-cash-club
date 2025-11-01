import React, { useEffect } from "react";

export default function StripeSuccess() { 
  useEffect(() => { 
    const t = setTimeout(() => { 
      window.location.href = "/login"; 
    }, 5000); 
    return () => clearTimeout(t); 
  }, []);

return (

Success! 🎉

    Your free trial has started. Check your email for your login link and instructions.
   
    Didn’t receive an email? Check your spam folder, or try signing in from the login page using your email.

Go to Login ); }