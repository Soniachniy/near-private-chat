import type React from "react";
import { Outlet } from "react-router";
import LeftSidebar from "@/components/sidebar";
import ChatVerifier from "../chat/ChatVerifier";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-row">
      <LeftSidebar />
      <div className="relative w-full flex-1">
        <Outlet />
      </div>
      <ChatVerifier />
    </div>
  );
};

export default Layout;
