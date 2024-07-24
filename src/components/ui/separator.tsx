import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  label?: string;
  className?: string;
  lineClassName?: string;
  textClassName?: string;
}
const Separator: React.FC<Props> = ({
  label,
  className,
  lineClassName,
  textClassName,
}) => {
  return (
    <div className={cn("items-center flex justify-center relative", className)}>
      <div className={cn("h-px bg-input w-full", lineClassName)} />
      
      <span className={cn("absolute z-10 bg-background px-4", textClassName)}>{label}</span>
    </div>
  );
};

export default Separator;
