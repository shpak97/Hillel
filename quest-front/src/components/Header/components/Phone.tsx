export default function Phone() {
    return (
            <a 
                href="tel:+38(050)555-99-55" 
                className="font-semibold text-[14px] leading-[100%] tracking-[3%] text-right text-gray hover:text-accent"
                style={{ fontVariantNumeric: 'lining-nums proportional-nums' }}
            >
                +38 (050) 555-99-55
            </a>
    )
}