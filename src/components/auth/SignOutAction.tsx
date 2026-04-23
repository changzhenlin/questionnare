'use client'

import { useClerk } from "@clerk/nextjs";

type SignOutActionProps = {
  children: React.ReactNode;
  className?: string;
};

export function SignOutAction({
  children,
  className,
}: SignOutActionProps) {
  const clerk = useClerk();

  return (
    <button
      type="button"
      className={className}
      onClick={() => clerk.signOut({ redirectUrl: "/" })}
    >
      {children}
    </button>
  );
}
