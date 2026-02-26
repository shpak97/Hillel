import { cn } from '../../utils/helpers/cn';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function Title({ children, className }: TitleProps) {
  return (
    <h1
      className={cn(
        'mb-[50px] font-extrabold text-[64px] leading-[110%] tracking-[0] align-middle text-white',
        className
      )}
    >
      {children}
    </h1>
  );
}