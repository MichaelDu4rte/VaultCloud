/* eslint-disable tailwindcss/migration-from-tailwind-2 */
"use client";
import React, { useState, useEffect } from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationMenu } from "./NotificationMenu";
import { SearchIcon } from "lucide-react";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  const toggleSearchModal = () => {
    setSearchModalOpen((prev) => !prev);
  };

  // Ctrl + K (or Cmd + K on macOS)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        toggleSearchModal();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <header className="header flex h-16 items-center justify-end border-b bg-background">
      <div className="flex items-center gap-3 px-5">
        <button
          onClick={toggleSearchModal}
          className="h-[45px] gap-2 rounded-lg bg-[#f0f0f0] px-4 text-[#333] shadow-drop-1 hover:bg-[#e0e0e0]"
        >
          <SearchIcon className="size-4 text-light-100" />
        </button>
        <FileUploader ownerId={userId} accountId={accountId} />
        <NotificationMenu />
        <ThemeToggle />
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-1/3 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={toggleSearchModal}
              className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <Search closeModal={toggleSearchModal} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
