import {ScrollVelocity} from '@animation'

const OutroMarquee = () => {
    return (
        <ScrollVelocity
            texts={['dikshant yadav']}
            velocity={60}
            numCopies={4}
            damping={30}
            stiffness={200}
            className="custom-scroll-text uppercase font-[font-p-1] font-black tracking-[0.15em] text-5xl sm:text-7xl md:text-8xl lg:text-9xl mix-blend-difference [text-shadow:0_0_4px_currentColor]"
            scrollerClassName="py-6 md:py-8"
        />
    )
}

export default OutroMarquee