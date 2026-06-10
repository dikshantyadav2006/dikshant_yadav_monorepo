import {ScrollVelocity} from '@animation'

const OutroMarquee = () => {
    return (
        <ScrollVelocity
            texts={[ 'dikshant yadav']}
            velocity={100}
            className="custom-scroll-text my-5 uppercase text-7xl md:text-9xl  outroMarquee  font-[font-p-4] mix-blend-difference font-black opacity-50 hover:opacity-75 transition-opacity duration-300"
        />
    )
}

export default OutroMarquee