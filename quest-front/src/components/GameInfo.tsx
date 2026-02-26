import { Children, Fragment, type ReactNode } from 'react';
import { cn } from '../utils/helpers/cn';

interface GameInfoProps {
  children: ReactNode;
  size?: 'small' | 'large';
  className?: string;
}

const gapClass = {
  small: 'mx-3.5', // 14px
  large: 'mx-6',   // 24px
} as const;

const heightClass = {
  small: 'h-5',   // 20px
  large: 'h-4',   // 16px
} as const;

export default function GameInfo({ children, size = 'small', className }: GameInfoProps) {
  const items = Children.toArray(children);

  return (
    <div className={cn('flex items-center', className)}>
      {items.map((child, index) => (
        <Fragment key={index}>
          {child}
          {index < items.length - 1 && (
            <span
              className={cn(
                'w-px shrink-0 bg-current',
                gapClass[size],
                heightClass[size]
              )}
              aria-hidden
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}