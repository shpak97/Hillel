export default function Header({ children }: { children: React.ReactNode }) {
    return (
        <header className="gradient-overlay fixed top-0 left-0 z-10 w-full py-4">
            <div className="container">
                <div className="flex justify-between items-center">
                    {children}
                </div>
            </div>
        </header>
    )
}