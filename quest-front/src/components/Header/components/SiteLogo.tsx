import { useRef } from 'react'
import siteLogo from '../../../assets/site-logo.svg'
import { NavLink } from 'react-router'
import { ROUTES } from '../../../utils/constants/routes'

export default function SiteLogo() {
    const prefetchedRef = useRef(false)

    const handleMouseEnter = () => {
        if (!prefetchedRef.current) {
            import('../../../pages/Home/Home').catch(() => {
                throw new Error('Failed to prefetch Home page')
            })
            prefetchedRef.current = true
        }
    }

    return (
        <NavLink 
            to={ROUTES.home}
            onMouseEnter={handleMouseEnter}
            className={({ isActive }) => isActive ? 'pointer-events-none flex' : 'cursor-pointer flex'}
        >
        <img src={siteLogo} alt="Site Logo" width={42} height={42}/>
        </NavLink>
    )
}