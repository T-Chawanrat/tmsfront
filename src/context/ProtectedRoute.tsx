// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isLoggedIn } = useAuth();

//   if (!isLoggedIn) {
//     return <Navigate to="/signin" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  allowedRoles?: number[];
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isLoggedIn, user } = useAuth();

  // ยังไม่ได้ login
  if (!isLoggedIn) return <Navigate to="/signin" replace />;

  // ✅ login แล้ว แต่ user ยังไม่มา (ตอน refresh/ตอนเพิ่ง login)
  if (!user) return null; // หรือใส่ <div>Loading...</div>

  // เช็ค role
  if (allowedRoles && !allowedRoles.includes(Number(user.role_id))) {
    return <Navigate to="/signin" replace />; // หรือไปหน้า /no-access
  }

  return <>{children}</>;
};

export default ProtectedRoute;


