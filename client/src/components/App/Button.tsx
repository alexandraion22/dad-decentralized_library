import React from "react";

type ButtonVariant = "default" | "nav";

type Props = {
  children: React.ReactNode;
  variant?: ButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, variant = "default", className = "", ...props }: Props) => {
  // Base classes for all button variants
  const baseClasses = "transition-all duration-300 hover:bg-green-200 hover:text-black";
  
  // Variant-specific classes
  const variantClasses = {
    default: "min-w-[300px] border-x border-green-200 p-4 -skew-x-[30deg] mx-4",
    nav: "px-3 py-1.5 rounded bg-gray-700 text-green-200 text-sm"
  };
  
  // Combine classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {variant === "default" ? (
        <div className="skew-x-[30deg]">{children}</div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
