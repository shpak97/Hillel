import { useRef } from 'react'
import { NavLink } from 'react-router'
import { NAVIGATION_ITEMS, ROUTES } from '../../../constants/routes'

const prefetchMap: Record<string, () => Promise<unknown>> = {
  [ROUTES.contacts]: () => import('../../../pages/Contacts'),
  [ROUTES.home]: () => import('../../../pages/Home'),
}

export default function Navigation() {
    const prefetchedRefs = useRef<Record<string, boolean>>({})

    const handleMouseEnter = (path: string) => {
        const prefetch = prefetchMap[path]
        if (prefetch && !prefetchedRefs.current[path]) {
            prefetch().catch(() => {
                // Ігноруємо помилки prefetching
            })
            prefetchedRefs.current[path] = true
        }
    }

    return (
        <nav>
            <ul className="flex items-center gap-13">
                {NAVIGATION_ITEMS.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `font-semibold text-[14px] leading-[100%] tracking-[3%] ${
                                    isActive ? 'text-accent' : 'text-gray hover:text-accent'
                                }`
                            }
                            style={{ fontVariantNumeric: 'lining-nums proportional-nums' }}
                            onMouseEnter={() => handleMouseEnter(item.path)}
                        >
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}