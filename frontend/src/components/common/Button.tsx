//.src/components/common/Button.tsx 

"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", ...props }: Props) {
  const className = variant === "ghost" ? "btn btn-ghost" : "btn";
  return <button {...props} className={className} />;
}
