import { ScrollFloat } from '@animation';

/**
 * FooterBrand Component
 * Editorial brand typography with motion
 */

const FooterBrand = ({ name }) => {
  return (
    <div className="  overflow-visible overflow-y-hidden my-0 mx-0 p-0">
      <h1
        className="
        inline-block
          align-top
          m-0 p-0
          pr-[0.12em]

          text-[15vw] sm:text-[16vw] md:text-[15vw] xl:text-[13vw]
          font-black
          uppercase
          tracking-[-0.06em]
          leading-[0.95] md:leading-[0.9]
          font-['font-p-1']
          whitespace-normal md:whitespace-nowrap
          
        "
      >
        <ScrollFloat
          enter={{ y: '25%', opacity: 0.5 }}
          to={{ y: '-10%', opacity: .81 }}
          exit={{ y: '0%', opacity: 1 }}
        >
          {name}
        </ScrollFloat>

      </h1>
    </div>
  );
};

export default FooterBrand;
