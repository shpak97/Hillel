import { cn } from '../../utils/helpers/cn';

interface SubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function Subtitle({ children, className }: SubtitleProps) {
  return (
    <div
      className={cn(
        'mb-1 font-family-raleway font-medium text-[14px] leading-[144%] tracking-[0] text-orange',
        className
      )}
    >
      {children}
    </div>
  );
}