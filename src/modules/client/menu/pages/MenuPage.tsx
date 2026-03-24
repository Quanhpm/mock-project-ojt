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
    <div className="bg-[var(--cf-bg)]">
      <MenuMobileCategoryTabs
        categories={vm.categories}
        activeCategory={vm.activeCategory}
        onSelectCategory={vm.scrollToSection}
      />

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 md:px-8 lg:gap-10 lg:px-10">
        <MenuDesktopCategorySidebar
          categories={vm.categories}
          activeCategory={vm.activeCategory}
          onSelectCategory={vm.scrollToSection}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-8">
          <MenuHero />

          <MenuControlBar
            search={vm.search}
            onSearchChange={vm.handleSearchChange}
            onSearchKeyDown={vm.handleKeyDown}
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
