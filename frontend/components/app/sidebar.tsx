"use client";

import { LogoutButton } from "@/components/logout-button";
import { CategoryList } from "./category-list";
import { NewCategoryRow } from "./new-category-row";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col py-10 pl-10 pr-4 lg:flex">
      <nav className="flex flex-1 flex-col gap-6">
        <CategoryList />
        <NewCategoryRow />
        <div className="mt-auto pt-4">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
