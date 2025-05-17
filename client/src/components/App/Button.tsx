import React from "react";

type Props = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = (props: Props) => {
  return (
    <button
      className='border-x border-green-200 p-4 -skew-x-[30deg] hover:bg-green-200 hover:text-black transition-all duration-300 mx-4'
      {...props}
    >
      <div className='skew-x-[30deg]'>{props.children}</div>
    </button>
  );
};

export default Button;
