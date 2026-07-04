import { BentoGrid } from '@sections'

const NavbarCard = ({ showNav, isDarkMode, addCursor, removeCursor, cursorModes }) => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <BentoGrid
        addCursor={addCursor}
        removeCursor={removeCursor}
        cursorModes={cursorModes}
      />
    </div>
  )
}

export default NavbarCard
