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
        <MenuDesktopCategorySidebar
          categories={vm.categories}
          activeCategory={vm.activeCategory}
          onSelectCategory={vm.scrollToSection}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-8">
          <MenuHero />

          <MenuMobileCategoryTabs
            categories={vm.categories}
            activeCategory={vm.activeCategory}
            onSelectCategory={vm.scrollToSection}
          />

          <MenuControlBar
            search={vm.search}
            franchiseId={vm.franchiseId}
            franchises={vm.franchises}
            onSearchChange={vm.handleSearchChange}
            onSearchKeyDown={vm.handleKeyDown}
            onFranchiseChange={vm.setFranchiseId}
          />

          {vm.showSearchResults ? (
            <MenuSearchResultSection
              search={vm.search}
              filteredProducts={vm.filteredProducts}
              franchiseId={vm.franchiseId}
            />
          ) : (
            <MenuCategorySections
              sections={vm.sections}
              franchiseId={vm.franchiseId}
              setSectionRef={vm.setSectionRef}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default MenuPage;
