import { type ReactNode } from 'react'
    import { cn } from '../../utils/helpers/cn'

interface MainProps {
  children: ReactNode
  className?: string
  backgroundImage?: string
}

export default function Main({ children, className, backgroundImage }: MainProps) {
  const baseClasses = 'min-h-screen pt-30.5 pb-25 relative'
  const bgClasses = backgroundImage ? 'bg-cover bg-center bg-no-repeat' : ''
  
  const mergedClasses = cn(baseClasses, bgClasses, className)

  const style = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : undefined

  return (
    <main 
      className={mergedClasses}
      style={style}
    >
      <div className="main-container">
        {children}
      </div>
    </main>
  )
}
