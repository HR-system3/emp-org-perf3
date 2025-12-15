//.src/components/common/Card.tsx

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Card({ title, subtitle, children, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "rounded-xl border bg-white p-4 shadow-sm",
        className || "",
      ].join(" ")}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  );
}
