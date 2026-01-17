# HƯỚNG DẪN MERGE NHANH: fe/feat/employee + develop-uioverhaul

## TÓM TẮT

✅ **Đã hoàn thành:**
- Phân tích chi tiết hai nhánh
- Tạo nhánh merge: `fe/feat/employee-merge-uioverhaul`
- Xác định chiến lược merge

📋 **Chiến lược:**
Giữ LOGIC từ `fe/feat/employee` + Điều chỉnh UI theo style của `develop-uioverhaul`

---

## SO SÁNH NHANH

| Tiêu chí | fe/feat/employee | develop-uioverhaul |
|----------|------------------|-------------------|
| **Logic & API** | ✅ Đầy đủ, có mock fallback | ❌ Đơn giản |
| **UI/UX** | ⚠️ Chưa đồng nhất | ✅ Đẹp, đồng nhất |
| **Type Safety** | ✅ Types đầy đủ | ❌ Thiếu types |
| **Validation** | ✅ Zod schema | ❌ Không có |
| **Schedule** | ✅ Có tính năng | ❌ Không có |
| **Mock Data** | ✅ Có | ❌ Không có |

**Kết luận:** fe/feat/employee vượt trội về tính năng, chỉ cần điều chỉnh UI.

---

## CÁC BƯỚC THỰC HIỆN

### BƯỚC 1: Điều chỉnh UI (CẦN LÀM THỦ CÔNG)

**File cần sửa:** `apps/web/src/features/employees/pages/EmployeeListPage.tsx`

**Các thay đổi UI cần thiết:**

1. **Container layout:**
   ```tsx
   // ❌ HIỆN TẠI (fe/feat/employee)
   <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
   
   // ✅ ĐỔI SANG (develop-uioverhaul style)
   <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
   ```

2. **Header section:**
   ```tsx
   // ❌ HIỆN TẠI
   <h1 className="text-3xl font-bold text-gray-800">Danh sách nhân viên</h1>
   
   // ✅ ĐỔI SANG
   <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
     Nhân Viên
   </h1>
   ```

3. **Button colors:**
   ```tsx
   // ❌ HIỆN TẠI (emerald)
   className="!bg-gradient-to-r !from-emerald-500 !to-teal-600"
   
   // ✅ ĐỔI SANG (teal)
   className="bg-[#1a998f] hover:bg-[#158f85]"
   ```

4. **Search bar:**
   - Giữ functionality từ fe/feat/employee
   - Thêm `border-teal-600/30 hover:border-teal-600`

5. **Table container:**
   - Giữ Antd Table
   - Wrap trong section với `border-[#102e3c]`
   - Sử dụng absolute positioning như develop-uioverhaul

**Chi tiết:** Xem `MERGE_ANALYSIS.md` Section 3.2 - BƯỚC 3

---

### BƯỚC 2: Merge develop-uioverhaul

```bash
# Đảm bảo đang ở nhánh merge
git checkout fe/feat/employee-merge-uioverhaul

# Merge develop-uioverhaul (không tự động commit)
git merge develop-uioverhaul --no-commit --no-ff

# Kiểm tra conflicts
git status
```

---

### BƯỚC 3: Resolve Conflicts

**Nguyên tắc chung:**
- ✅ **GIỮ LẠI** tất cả từ fe/feat/employee:
  - `api/employees.ts` (API đầy đủ)
  - `hooks/useEmployees.ts` (React Query hooks)
  - `types/index.ts` (Types đầy đủ)
  - `schema/employee.schema.ts` (Validation)
  - `constants/sampleEmployees.ts` (Mock data)
  - `components/EmployeeModal.tsx` (CRUD modal)
  - `components/ShiftModal.tsx` (Schedule modal)
  - `pages/EmployeeListPage.tsx` (với UI đã điều chỉnh)
  - `pages/EmployeeSchedulePage.tsx` (Tính năng mới)

- ❌ **XÓA** từ develop-uioverhaul:
  - `components/EmployeeDetailPanel.tsx` (thay bằng Sheet)
  - `components/EmployeeEditPanel.tsx` (thay bằng EmployeeModal)
  - `components/EmployeeTable.tsx` (logic đã tích hợp)
  - `components/EmployeeListPage.tsx` (trong components, không phải pages)
  - `components/EmployeesPage.tsx` (đã refactor)

**Resolve từng file:**
```bash
# Với mỗi conflict, chọn phiên bản phù hợp
git checkout --ours <file>   # Giữ từ fe/feat/employee
git checkout --theirs <file>  # Giữ từ develop-uioverhaul (ít dùng)

# Hoặc merge thủ công trong editor
```

---

### BƯỚC 4: Testing

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test checklist:
# [ ] Hiển thị danh sách nhân viên
# [ ] Tìm kiếm và filter
# [ ] Mở detail panel khi click row
# [ ] Modal thêm/sửa nhân viên
# [ ] Xóa nhân viên
# [ ] Schedule page (/employees/schedule)
# [ ] API fallback khi backend offline
# [ ] Responsive design
# [ ] No console errors
```

---

### BƯỚC 5: Commit

```bash
# Add tất cả changes
git add .

# Commit với message rõ ràng
git commit -m "merge: integrate develop-uioverhaul UI with fe/feat/employee logic

- Keep full logic and features from fe/feat/employee
- Apply UI styling from develop-uioverhaul for consistency
- Resolve conflicts favoring fe/feat/employee functionality
- Update EmployeeListPage to match design system
- Remove deprecated components (EmployeeDetailPanel, EmployeeEditPanel)
- Add new features: schedule management, invite employee
- Update dependencies and types
"

# Push to remote
git push -u origin fe/feat/employee-merge-uioverhaul
```

---

## XỬ LÝ CONFLICTS PHỔ BIẾN

### Conflict 1: EmployeeListPage location
```bash
# Xóa phiên bản trong components/
git rm apps/web/src/features/employees/components/EmployeeListPage.tsx

# Giữ phiên bản trong pages/
git add apps/web/src/features/employees/pages/EmployeeListPage.tsx
```

### Conflict 2: employees.ts
```bash
# Giữ hoàn toàn phiên bản fe/feat/employee
git checkout --ours apps/web/src/features/employees/api/employees.ts
git add apps/web/src/features/employees/api/employees.ts
```

### Conflict 3: index.ts (exports)
```bash
# Giữ phiên bản fe/feat/employee (export đầy đủ)
git checkout --ours apps/web/src/features/employees/index.ts
git add apps/web/src/features/employees/index.ts
```

### Conflict 4: package.json
```bash
# Giữ phiên bản fe/feat/employee
git checkout --ours package.json
git checkout --ours package-lock.json
git add package.json package-lock.json

# Install lại
npm install
```

---

## ROLLBACK (NẾU CẦN)

```bash
# Nếu merge thất bại, abort
git merge --abort

# Hoặc reset về trước merge
git reset --hard HEAD

# Hoặc xóa nhánh và tạo lại
git checkout fe/feat/employee
git branch -D fe/feat/employee-merge-uioverhaul
git checkout -b fe/feat/employee-merge-uioverhaul
```

---

## CHECKLIST TRƯỚC KHI TẠO PR

- [ ] Đã điều chỉnh UI theo develop-uioverhaul
- [ ] Đã merge develop-uioverhaul thành công
- [ ] Đã resolve tất cả conflicts
- [ ] Đã test tất cả tính năng
- [ ] Không có linter errors
- [ ] Không có TypeScript errors
- [ ] Không có console errors
- [ ] UI responsive trên mobile
- [ ] API fallback hoạt động
- [ ] Đã commit với message rõ ràng

---

## HỖ TRỢ

**Chi tiết đầy đủ:** Xem `MERGE_ANALYSIS.md`

**Cấu trúc file sau merge:**
```
apps/web/src/features/employees/
├── api/
│   └── employees.ts          [✅ Giữ từ fe/feat/employee]
├── components/
│   ├── EmployeeModal.tsx     [✅ Giữ từ fe/feat/employee]
│   ├── ShiftModal.tsx        [✅ Giữ từ fe/feat/employee]
│   ├── EmployeesPage.tsx     [✅ Giữ từ fe/feat/employee]
│   └── SidebarSection.tsx    [✅ Giữ từ fe/feat/employee]
├── constants/
│   └── sampleEmployees.ts    [✅ Giữ từ fe/feat/employee]
├── hooks/
│   └── useEmployees.ts       [✅ Giữ từ fe/feat/employee]
├── pages/
│   ├── EmployeeListPage.tsx  [✅ Giữ từ fe/feat/employee + UI điều chỉnh]
│   └── EmployeeSchedulePage.tsx [✅ Giữ từ fe/feat/employee]
├── schema/
│   └── employee.schema.ts    [✅ Giữ từ fe/feat/employee]
├── types/
│   └── index.ts              [✅ Giữ từ fe/feat/employee]
└── index.ts                  [✅ Giữ từ fe/feat/employee]
```

---

**Ngày tạo:** 17/01/2026  
**Trạng thái:** ✅ SẴN SÀNG THỰC HIỆN  
**Thời gian ước tính:** 6-10 giờ
