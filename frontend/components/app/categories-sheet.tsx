"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { CategoryList } from "./category-list";
import { NewCategoryRow } from "./new-category-row";

type CategoriesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CategoriesSheet({ open, onOpenChange }: CategoriesSheetProps) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (open && pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      onOpenChange(false);
    } else {
      prevPathnameRef.current = pathname;
    }
  }, [pathname, open, onOpenChange]);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="[--backdrop-opacity:0.3] [--bleed:3rem] fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[(-webkit-touch-callout:none)]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup className="-mb-12 w-full max-h-[calc(80vh+3rem)] overflow-y-auto overscroll-contain touch-auto rounded-t-2xl border-t border-x border-border bg-bg px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] pt-4 text-gray-900 shadow-2xl outline outline-gray-200 transform-[translateY(var(--drawer-swipe-movement-y))] transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:transform-[translateY(calc(100%-3rem))] data-starting-style:transform-[translateY(calc(100%-3rem))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]">
            <div
              className="mb-4 h-1 w-12 mx-auto rounded-full bg-border/40"
              aria-hidden
            />
            <Drawer.Content className="scrollbar mx-auto w-full max-w-lg">
              <nav className="flex flex-col gap-6">
                <CategoryList />
                <NewCategoryRow />
              </nav>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
