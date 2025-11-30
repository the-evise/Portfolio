import type { ReactNode } from "react";

interface TempLayoutProps {
  children: ReactNode;
}

export default function TempLayout({ children }: TempLayoutProps) {
  return (
      <>
          {children}
      </>
  );
}
