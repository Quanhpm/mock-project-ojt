import {
  MenuCategorySections,
  MenuControlBar,
  MenuDesktopCategorySidebar,
  MenuHero,
  MenuMobileCategoryTabs,
  MenuSearchResultSection,
} from '../components';
import { useMenuPage } from '../hooks/use-menu-page.hook';

function MenuPage() {
  const vm = useMenuPage();

  return (
    <div className="min-h-screen bg-[var(--cf-bg)]">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 md:px-8 lg:gap-10 lg:px-10">
        {/* Desktop sidebar navigation */}
        <MenuDesktopCategorySidebar
          categories={vm.validCategories}
          activeCategory={vm.activeCategory}
          onSelectCategory={vm.scrollToSection}
        />

        {/* Main content section */}
        <section className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Hero banner */}
          <MenuHero />

          {/* Mobile category tabs navigation */}
          <MenuMobileCategoryTabs
            categories={vm.validCategories}
            activeCategory={vm.activeCategory}
            onSelectCategory={vm.scrollToSection}
          />

          {/* Search and filter controls */}
          <MenuControlBar
            search={vm.search}
            franchiseId={vm.franchiseId}
            franchises={vm.franchises}
            onSearchChange={vm.handleSearchChange}
            onSearchKeyDown={vm.handleKeyDown}
            onFranchiseChange={vm.setFranchiseId}
          />

          {/* Products display: search results or categories */}
          {vm.showSearchResults ? (
            <MenuSearchResultSection
              search={vm.search}
              filteredProducts={vm.filteredProducts}
              franchiseId={vm.franchiseId}
            />
          ) : (
            <MenuCategorySections
              categories={vm.validCategories}
              franchiseId={vm.franchiseId}
              getProductByCategory={vm.getProductByCategory}
              setSectionRef={vm.setSectionRef}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default MenuPage;