import SideNav from "./SideNav";
import Categories from "./Category";

function MainNav() {
  return (
    <>
      <nav className="w-56 bg-white shadow-sm fixed left-0 top-14 bottom-0 flex flex-col p-4">
        <div className="flex-grow overflow-y-auto">
          <SideNav />
        </div>
        <Categories />
      </nav>
    </>
  );
}

export default MainNav;
