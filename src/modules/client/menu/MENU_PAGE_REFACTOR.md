# Menu Page Refactor Notes

Tai lieu nay ghi lai toan bo thay doi cho man hinh `MenuPage` sau dot refactor toi uu API va dong bo category theo du lieu thuc te cua `getMenu`.

## 1. Muc tieu refactor

Muc tieu chinh:

- Loai bo API goi du thua `getAllCategoriesByFranchise`.
- Chi dung `getMenuByFranchise` lam nguon du lieu chinh cho danh muc va san pham.
- Dam bao category hien thi luon khop voi menu thuc te.
- Category nao khong co san pham thi khong hien thi.
- Them hanh vi scroll sync:
  - Scroll danh sach san pham -> sidebar active theo section dang thay.
  - Click category -> cuon muot toi section tuong ung.
- Tach logic ro rang theo hook/component de de bao tri.

## 2. Truoc va sau refactor

### Truoc refactor

Luong cu:

```text
MenuPage
  -> useMenuPage
     -> useMenuData
        -> getAllFranchises
        -> getAllCategoriesByFranchise
        -> getMenuByFranchise
     -> filterValidCategories
     -> useScrollSpy
     -> useProductSearch
```

Van de:

- Goi 2 API de lay category va menu trong khi `getMenuByFranchise` da co thong tin category.
- Can loc lai `validCategories` de loai category rong.
- Sidebar/category va product section phu thuoc 2 nguon du lieu khac nhau, de gay lech neu backend thay doi.

### Sau refactor

Luong moi:

```text
MenuPage
  -> useMenuPage
     -> useMenu
        -> getAllFranchises
        -> getMenuByFranchise
        -> buildMenuSections
        -> buildMenuCategories
     -> useScrollSpy
     -> useProductSearch
```

Loi ich:

- Chi con 1 nguon du lieu cho menu section va category.
- Khong can API categories rieng.
- Khong can hardcode category.
- Category list luon phan anh dung du lieu tu menu.

## 3. File da thay doi

### File moi

- `src/modules/client/menu/hooks/use-menu.hook.ts`
- `src/modules/client/menu/components/MenuSection.tsx`
- `src/modules/client/menu/MENU_PAGE_REFACTOR.md`

### File da sua

- `src/modules/client/menu/pages/MenuPage.tsx`
- `src/modules/client/menu/hooks/use-menu-page.hook.ts`
- `src/modules/client/menu/hooks/use-product-search.hook.ts`
- `src/modules/client/menu/hooks/use-scroll-spy.hook.ts`
- `src/modules/client/menu/services/menu-page.service.ts`
- `src/modules/client/menu/components/CategorySideBar.tsx`
- `src/modules/client/menu/components/MenuDesktopCategorySidebar.tsx`
- `src/modules/client/menu/components/MenuMobileCategoryTabs.tsx`
- `src/modules/client/menu/components/MenuCategorySections.tsx`
- `src/modules/client/menu/components/index.ts`
- `src/modules/client/menu/hooks/index.ts`

### File da xoa

- `src/modules/client/menu/hooks/use-menu-data.hook.ts`

## 4. Giai thich luong du lieu moi

### 4.1 Chon franchise

1. `useMenuPage` lay `franchiseId` tu `useStore`.
2. `useMenu` goi `getAllFranchises()`.
3. Neu chua co `franchiseId`, hook tu dong chon franchise dau tien.
4. Khi `franchiseId` thay doi, `useMenu` goi `getMenuByFranchise(franchiseId, '')`.

### 4.2 Bien doi du lieu menu

Response cua `getMenuByFranchise` co dang nhom theo category:

```ts
[
  {
    category_id: '...',
    category_name: 'Coffee',
    category_display_order: 1,
    products: [...]
  }
]
```

Tay vi goi them API category, ta bien doi truc tiep:

```text
menu response
  -> filterNonToppingItems
  -> buildMenuSections
  -> buildMenuCategories
```

Ket qua:

- `sections`: dung de render cot phai.
- `categories`: dung de render sidebar va mobile tabs.

Ca 2 deu duoc sinh tu cung 1 nguon.

## 5. Giai thich service transform

File: `src/modules/client/menu/services/menu-page.service.ts`

### `filterNonToppingItems`

Nhiem vu:

- Loai bo category co ten chua `topping`.
- Muc dich la khong dua nhom topping vao menu chinh.

### `buildMenuSections`

Nhiem vu:

- Nhan vao mang `MenuByFranchise[]`.
- Bo qua category khong co `products`.
- Gom du lieu thanh `MenuSectionData`.
- Gan `domId` cho tung section de phuc vu scroll.
- Sort theo `category_display_order`.

Kieu du lieu moi:

```ts
interface MenuSectionData {
  id: string;
  name: string;
  domId: string;
  displayOrder: number;
  products: MenuProduct[];
}
```

Y nghia:

- `id`: key on dinh de active/highlight.
- `name`: ten hien thi.
- `domId`: id DOM de scroll den section.
- `displayOrder`: giu thu tu backend.
- `products`: danh sach mon cua section.

### `buildMenuCategories`

Nhiem vu:

- Rut gon `sections` thanh model nhe hon cho sidebar/mobile tab.
- Tranh lap logic mapping o nhieu component.

```ts
interface MenuCategory {
  id: string;
  name: string;
  domId: string;
  displayOrder: number;
}
```

## 6. Giai thich hook `useMenu`

File: `src/modules/client/menu/hooks/use-menu.hook.ts`

Hook nay thay the `useMenuData` cu.

Trach nhiem:

- Lay danh sach franchise.
- Xac dinh `franchiseId` dang dung.
- Goi menu theo franchise.
- Build ra `categories` va `sections`.

### Vi sao hook nay tot hon hook cu

- Khong giu `categories` va `products` tu 2 API rieng.
- Giam nguy co mismatch giua sidebar va content.
- De test hon vi logic transform tap trung o mot noi.

### Luong trong hook

```text
mount
  -> fetch franchises
  -> set franchise mac dinh neu can

franchiseId change
  -> fetch menu
  -> build sections
  -> build categories
```

### Diem ky thuat can chu y

- Co `isMounted` de tranh update state sau unmount.
- Dung `useMemo` de tranh build lai `sections/categories` khong can thiet.
- Dung `useStore.getState()` de tranh race condition khi user doi franchise nhanh.

## 7. Giai thich hook `useMenuPage`

File: `src/modules/client/menu/hooks/use-menu-page.hook.ts`

Hook nay la view-model cho `MenuPage`.

Nhiem vu:

- Lay du lieu menu da transform tu `useMenu`.
- Lay logic active category tu `useScrollSpy`.
- Lay logic search tu `useProductSearch`.
- Tra ve bo props gon gon cho page.

Y nghia:

- Page chi con viec render.
- Logic du lieu va behavior duoc tach khoi UI.

## 8. Giai thich hook `useProductSearch`

File: `src/modules/client/menu/hooks/use-product-search.hook.ts`

Thay doi chinh:

- Truoc day search tren `MenuByFranchise[]`.
- Bay gio search tren `MenuSectionData[]`.

Hanh vi:

- Nhap text.
- Nhan `Enter` -> tim trong:
  - ten san pham
  - ten category
- Xoa input rong -> clear ket qua.

Loi ich:

- Search su dung dung model dang render, khong can biet API cu/ moi.

## 9. Giai thich hook `useScrollSpy`

File: `src/modules/client/menu/hooks/use-scroll-spy.hook.ts`

Day la phan quan trong nhat cua trai nghiem moi.

### Nhiem vu

- Luu ref cua tung section.
- Click category -> scroll smooth den section.
- Theo doi section dang visible bang `IntersectionObserver`.
- Cap nhat `activeCategory` de sidebar/mobile tab highlight dung.

### Luong click category

```text
User click category
  -> scrollToSection(categoryId)
  -> scrollIntoView({ behavior: 'smooth' })
  -> setTrackedCategory(categoryId)
  -> UI highlight ngay category vua click
```

### Luong khi user scroll

```text
User scroll content
  -> IntersectionObserver nhan entries
  -> loc section dang intersect
  -> lay section gan top nhat
  -> doc data-category-id
  -> setTrackedCategory(nextCategoryId)
  -> sidebar/mobile tab doi active state
```

### Vi sao dung `data-category-id`

- Tranh phu thuoc truc tiep vao ten category.
- Su dung id on dinh de compare active state.
- Giu DOM id va business id tach ro rang.

### Vi sao co `sectionRefVersion`

Khi search mode bat/tat, section co the unmount/remount.
`sectionRefVersion` giup observer re-bind lai dung danh sach ref moi.

## 10. Giai thich component UI

### `MenuPage.tsx`

Trang chinh chi con:

- render sidebar desktop
- render hero
- render mobile tabs
- render control bar
- render search result hoac category sections

No khong con tu xu ly filter category hay group products.

### `MenuDesktopCategorySidebar.tsx`

Nhiem vu:

- Render category list desktop.
- Nhan `categories`, `activeCategory`, `onSelectCategory`.
- Sidebar co `sticky` de de dieu huong khi cuon dai.

### `CategorySideBar.tsx`

Nhiem vu:

- Render 1 nut category.
- Neu `isActive === true` thi doi background/text/shadow.

Day la noi active style duoc ap dung.

### `MenuMobileCategoryTabs.tsx`

Nhiem vu:

- Render tabs ngang tren mobile.
- Click tab -> scroll den section.
- Highlight tab dang active theo `activeCategory`.

### `MenuCategorySections.tsx`

Nhiem vu:

- Nhan `sections`.
- Lap qua tung section va render `MenuSection`.

Component nay gio tro nen rat gon, de doc.

### `MenuSection.tsx`

Component moi, tach rieng de:

- gom UI cho 1 category section
- gan `id`
- gan `data-category-id`
- dang ky `ref`
- render danh sach `ProductCard`

Tach rieng thanh file rieng giup:

- code de doc hon
- de tai su dung
- observer logic ro hon

## 11. Luong render tren UI

```text
getMenuByFranchise response
  -> useMenu
     -> sections
     -> categories
  -> useMenuPage
     -> activeCategory
     -> search state
  -> MenuPage
     -> MenuDesktopCategorySidebar (left)
     -> MenuMobileCategoryTabs (mobile)
     -> MenuCategorySections (right)
```

### Layout sau refactor

```text
LEFT
  category list sinh dong tu menu data

RIGHT
  grouped products theo category tu cung menu data
```

## 12. Tai sao category rong khong con hien thi

Ly do:

- `buildMenuSections` bo qua item co `products.length === 0`.
- `buildMenuCategories` duoc sinh tu `sections`.

Vi vay:

```text
Khong co section
  -> khong co category
```

Khong can them buoc `filterValidCategories` rieng nhu truoc.

## 13. Performance notes

Refactor nay co cac diem toi uu sau:

- Giam 1 API call (`getAllCategoriesByFranchise`).
- `sections` va `categories` duoc memo hoa bang `useMemo`.
- `MenuCategorySections` va `CategorySideBar` duoc `memo`.
- `IntersectionObserver` tot hon viec nghe `scroll` lien tuc.
- Data transform tap trung o 1 cho, giam render va mapping lap lai.

## 14. Luu y ve API

API `getAllCategoriesByFranchise` van con ton tai trong file API chung:

- `src/apis/endpointsCLIENT/client.api.ts`

Nhung voi `MenuPage`, API nay da khong con duoc su dung nua.

Neu sau nay muon toi uu tiep, co the:

- de nguyen API vi man hinh khac co the con dung
- hoac xoa sau khi confirm toan repo khong con su dung

## 15. Luu y khi mo rong sau nay

Neu can them bo loc moi theo category/menu:

- uu tien transform trong `menu-page.service.ts`
- giu `useMenu` la noi tong hop du lieu
- khong de component UI tu map/adapt API response

Neu can them behavior scroll moi:

- uu tien sua trong `useScrollSpy`
- tranh viet logic scroll o page/component de khoi bi phan tan

## 16. Ket luan ngan

Sau refactor:

- `MenuPage` da bo goi API category rieng.
- Category va section dung chung 1 nguon du lieu tu `getMenuByFranchise`.
- Sidebar va mobile tabs dong bo voi scroll.
- Click category co smooth scroll.
- Code duoc tach ro hon thanh `useMenu`, `MenuSection`, `CategorySidebar`.

---

Cap nhat lan cuoi: 23/03/2026
