import React from "react";
import Navbar from "../common/Navbar";
import Text from "../common/Text";
import Icon from "../common/Icon";
import ActionButtons from "../common/ActionButtons";
import "../../styles/index.css";

export default function Header() {
  return (
    <header className="bg-[var(--color-bg)] min-h-screen flex flex-col justify-between px-8 py-6 md:px-16">
      <Navbar />

      <div className="flex flex-col md:flex-row items-center justify-between mt-20 md:mt-32">
        <div className="max-w-xl space-y-6">
          <Text />
      
          <ActionButtons />
        </div>

        <Icon />
      </div>
    </header>
  );
}
