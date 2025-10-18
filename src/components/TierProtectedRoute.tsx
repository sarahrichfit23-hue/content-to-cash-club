import React from "react";

export const TierProtectedRoute = ({ children }) => {
  // 🚨 For testing: always allow access
  return <>{children}</>;
};