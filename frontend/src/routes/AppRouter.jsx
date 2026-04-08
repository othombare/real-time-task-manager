import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../Pages/Dashboard/Home";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import ResetPassword from "../Pages/Auth/ResetPassword";

import Projects from "../Pages/Projects/Projects";
import ProjectBoard from "../Pages/Projects/ProjectBoard";
import ProjectTeamMembers from "../Pages/Projects/ProjectTeamMembers";
import PerToDo from "../Pages/PerToDo";
import TeamMembers from "../Pages/TeamMembers/TeamMembers";
import Analytics from "../Pages/Analytics/Analytics";
import Message from "../Pages/Message/Message";
import Settings from "../Pages/Settings/Settings";
import Notifications from "../Pages/Notifications/Notifications";
import MyProfile from "../Pages/MyProfile/MyProfile";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/resetPassword/:token"
          element={<ResetPassword />}
        />
        {/* Protected workspace screens */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        
       
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectSlug"
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectSlug/team-members"
          element={
            <ProtectedRoute>
              <ProjectTeamMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-members"
          element={
            <ProtectedRoute>
              <TeamMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/message"
          element={
            <ProtectedRoute>
              <Message />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personal-todo"
          element={
            <ProtectedRoute>
              <PerToDo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
