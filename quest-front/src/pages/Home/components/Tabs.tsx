import { cn } from '../../../utils/helpers/cn';

interface TabsProps {
  buttons: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Tabs({ buttons, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex mb-15.75">
      {buttons.map((button) => {
        const isActive = activeTab === button;
        return (
          <button
            key={button}
            type="button"
            onClick={() => onTabChange(button)}
            className={cn(
              'py-2 px-6 first:rounded-l-2xl last:rounded-r-2xl transition-colors cursor-pointer border',
              isActive
                ? 'border-accent bg-accent text-dark-gray shadow-none'
                : 'color-gray border-gray hover:text-dark-gray hover:border-accent hover:bg-[rgba(217,217,217,0.1)] hover:shadow-none bg-[rgba(217,217,217,0.1)] shadow-[0px_4px_8px_-4px_#FFFFFF40_inset,0px_-4px_8px_-4px_#FFFFFF40_inset]'
            )}
          >
            {button}
          </button>
        );
      })}
    </div>
  );
}