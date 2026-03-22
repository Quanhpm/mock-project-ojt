# Tai lieu module Menu (Client)

Module Menu dung de hien thi danh sach mon an theo danh muc, tim kiem san pham, xem chi tiet mon, tuy chon size topping va them vao gio hang.

## Muc tieu

- To chuc code theo tung phan ro rang: giao dien, du lieu, xu ly nghiep vu.
- Tai su dung logic qua custom hook.
- Toi uu trai nghiem tren desktop va mobile.
- De mo rong cho nhieu chi nhanh (franchise).

## Cau truc thu muc

```text
menu/
├── components/   # Thanh phan UI tai su dung
├── hooks/        # Custom hooks theo tung use case
├── layouts/      # Layout (hien dang de trong)
├── pages/        # Trang MenuPage va Item
├── services/     # Ham tien ich xu ly du lieu
└── index.ts      # Diem vao module
```

## Mo ta tong quan

Module gom 2 man hinh chinh:

- MenuPage: hien thi hero, dieu huong danh muc, thanh tim kiem, danh sach mon theo danh muc hoac ket qua tim kiem.
- Item: hien thi chi tiet san pham, gallery anh, chon size/topping, tinh tong tien, them vao gio.

## Components chinh

| Component | Vai tro |
| --- | --- |
| CategorySideBar | Thanh danh muc co ban |
| MenuDesktopCategorySidebar | Dieu huong danh muc tren desktop |
| MenuMobileCategoryTabs | Dieu huong danh muc tren mobile |
| MenuControlBar | O tim kiem + bo loc chi nhanh |
| MenuCategorySections | Hien thi mon theo tung danh muc |
| MenuSearchResultSection | Hien thi ket qua tim kiem |
| ProductCard | The hien thi thong tin 1 mon |
| MenuHero | Khu vuc hero dau trang |
| ItemImageGallery | Gallery anh trong trang chi tiet |
| ItemPurchasePanel | Khu vuc mua hang trong trang chi tiet |

## Hooks va trach nhiem

Tat ca hook duoc dat ten theo chuan kebab-case va ket thuc bang .hook.ts.

### use-menu-page.hook.ts

Hook tong hop cho MenuPage, gom:

- Quan ly franchise dang chon.
- Lay danh sach franchise, danh muc, san pham.
- Loc danh muc hop le (co san pham).
- Quan ly scroll spy cho danh muc dang active.
- Quan ly tim kiem va ket qua tim kiem.

### use-item-page.hook.ts

Hook tong hop cho Item, gom:

- Doc franchiseId va productId tu navigation state.
- Lay chi tiet san pham va danh sach topping.
- Quan ly so luong, topping da chon, anh dang xem.
- Tinh tong tien theo cong thuc:

$$
Tong\_tien = (Gia\_size + Tong\_gia\_topping) \times So\_luong
$$

- Xu ly them vao gio hang (kiem tra dang nhap, thong tin giao hang, trang thai loading).

### use-menu-data.hook.ts

Hook phu trach tai du lieu menu:

- Goi API franchise mot lan khi mount.
- Khi doi franchise: tai song song categories va products.
- Loai bo nhom topping khoi danh sach menu chinh.

### use-product-detail.hook.ts

Hook phu trach du lieu chi tiet mon:

- Goi API chi tiet theo franchiseId va productId.
- Tu dong chon size dau tien hop le.
- Neu san pham co topping thi nap danh sach topping lien quan.
- Co cleanup tranh cap nhat state sau khi unmount.

### use-product-search.hook.ts

Hook tim kiem theo ten san pham hoac ten danh muc:

- Nhap tu khoa.
- Nhan Enter de tao ket qua.
- Xoa ket qua khi o tim kiem rong.

### use-scroll-spy.hook.ts

Hook dong bo dieu huong danh muc khi cuon:

- Theo doi section dang trong viewport bang IntersectionObserver.
- Cap nhat danh muc active.
- Scroll den section khi click danh muc.

### use-store.hook.ts

Store nho gon bang Zustand de luu franchiseId dang chon.

## Services

### menu-page.service.ts

- getDisplaySizeLabel: chuyen doi nhan size hien thi (default -> Mac dinh).
- filterNonToppingItems: loai bo item co category_name chua topping.
- filterValidCategories: chi giu danh muc co san pham.

## Luong du lieu

```text
MenuPage
  -> use-menu-page.hook
     -> use-store.hook
     -> use-menu-data.hook
        -> getAllFranchises
        -> getAllCategoriesByFranchise
        -> getMenuByFranchise
     -> use-product-search.hook
     -> use-scroll-spy.hook
```

```text
Item
  -> use-item-page.hook
     -> use-product-detail.hook
        -> getProductDetail
        -> getMenuByFranchise (nap topping khi can)
     -> addCartItem
```

## Diem manh ky thuat

- Tach ro logic va UI, de test va de bao tri.
- Giam lap code bang utility dung chung.
- Co xu ly loi va fallback du lieu trong cac hook.
- Toi uu tinh toan bang useMemo/useCallback o cac diem can thiet.
- Ho tro giao dien responsive cho desktop va mobile.

## Cach su dung nhanh

Su dung trang menu mac dinh cua module:

```tsx
import MenuPage from '@/modules/client/menu';

export default function Screen() {
  return <MenuPage />;
}
```

Su dung hook tong hop neu can tao man hinh tuy bien:

```tsx
import { useMenuPage } from '@/modules/client/menu/hooks';

export function CustomMenuView() {
  const vm = useMenuPage();
  return <div>{vm.validCategories.length}</div>;
}
```

## Luu y khi mo rong

- Giu naming convention cho hooks: use-xxx.hook.ts.
- Neu them logic loc du lieu, uu tien dua vao services de tranh trung lap.
- Neu them API call moi, dam bao co xu ly loading + error + cleanup.
- Neu thay doi navigation vao trang Item, can truyen day du franchiseId/productId.

---

Cap nhat lan cuoi: 22/03/2026
