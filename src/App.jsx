import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/Home";
import CommunityPage from "./pages/Community";
import Submit from "./pages/Submit";
import RootLayout from "./pages/Root";
import { loader as postLoader } from "./pages/Home";
import { loader as popularPostLoader } from "./pages/PopularPage";
import { loader as NewestPostLoader } from "./pages/NewestPage";
import ErrorPage from "./pages/ErrorPage";
import UserPage from "./pages/UserPage";
import EditPage from "./pages/EditPage";
import UserProfile from "./pages/UserProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import Chat from "./chat/index";
import Profile from "./chat/Profile";
import ChatLayout from "./pages/ChatLayout";
import ProtectedRoute from "./components/ProtectRoute";
import { SocketProvider } from "./context/socketContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: postLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: "/popular",
        element: <HomePage />,
        loader: popularPostLoader,
      },
      {
        path: "/newest",
        element: <HomePage />,
        loader: NewestPostLoader,
      },
      {
        path: "/content/:contentId",
        element: <PostDetailPage />,
      },
      { path: "/community", element: <CommunityPage /> },
      { path: "/create", element: <Submit /> },
      {
        path: "/user/:userId",
        children: [
          {
            index: true,
            element: <UserPage />,
          },
          {
            path: "edit",
            element: <EditPage />,
          },
          {
            path: "profile",
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <SocketProvider>
          <ChatLayout />
        </SocketProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Chat />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
