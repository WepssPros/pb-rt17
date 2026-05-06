# Table Design & Fitur — Konfigurasi Standar

Dokumen ini adalah referensi desain + fungsi tabel untuk proyek baru.  
Tujuan: AI/engineer lain dapat meniru **layout, style, dan fitur** tabel dengan konsisten.

---

## 1) Struktur Komponen Utama

Gunakan komponen tabel generik:

- `DataTable` (komponen inti)
- `FilterModal` (multi-filter)
- `ColumnVisibilityDialog` (toggle kolom)
- `useInfiniteScroll` (infinite scroll loader)

**Path referensi:**

- `src/components/datatable/data-table.tsx`
- `src/components/datatable/filter-modal.tsx`
- `src/components/datatable/column-visibility-dialog.tsx`
- `src/hooks/use-infinite-scroll.ts`

---

## 2) Layout & Tinggi Tabel (Scroll Internal + Sticky Header)

**Tujuan:** halaman tidak scroll panjang. Scroll hanya di area tabel (infinite scrolling terasa).

### Aturan Layout

- Wrapper tabel **harus** punya `max-height` responsif + `overflow-auto`.
- Header tabel **sticky** di `top: 0` dengan `z-index`.

### Contoh Class

```tsx
<div className="max-h-[60vh] md:max-h-[65vh] lg:max-h-[70vh] overflow-auto">
  <table className="w-full text-sm">
    <thead>
      <tr>
        <th className="sticky top-0 z-10 bg-[#F8FAFC] ...">...</th>
      </tr>
    </thead>
  </table>
</div>
```

---

## 3) Toolbar (Search + Menu Ikon)

Toolbar menampilkan:

- **Search input** (kiri)
- **Menu icon** (kanan): Filter + Column Visibility

Ikon hanya di kanan, tidak ada text label:

- Filter: `SlidersHorizontal`
- Column visibility: `Columns`

---

## 4) Multi-Filter (FilterModal)

**Konsep:** user bisa menambah banyak filter (kolom + nilai).

Fitur:

- Tombol **Tambah Filter**
- Dropdown kolom
- Multi-select nilai (checkbox list)
- Tombol **Reset** dan **Terapkan**
- tidak ada tombol action

Aturan:

- Kolom yang sudah dipakai tidak boleh dipilih ulang.
- Jika nilai kosong, filter dianggap tidak aktif.

---

## 5) Column Visibility

Modal compact (bukan besar).

Fitur:

- List kolom + toggle ON/OFF
- Kolom wajib tidak bisa dimatikan

---

## 6) Infinite Scroll

Aktif untuk semua tabel:

- `useInfiniteScroll` menerima semua data
- Loader ditaruh **di dalam container scroll**

Catatan:

- Jika `hasMore === false`, tampilkan “All results loaded”.

---

## 7) Style Guidelines (Wajib)

### Header Table

- Background: `#F8FAFC`
- Text: uppercase, small, tracking wide
- Sticky

### Row

- Border bottom: `#E2E8F0`
- Hover: `bg-[#F8FAFC]`

### Input Search

- Tinggi 36px (`h-9`)
- Lebar default: `w-56`
- Icon search di kiri

### Icon Button (Filter & Columns)

- Bentuk circle
- Border `#E2E8F0`
- Hover: border & text ke `#0F4C5C`

---

## 8) Implementasi Reuse di Semua Page

**Semua halaman tabel harus memakai `DataTable`** agar fitur konsisten:

Contoh:

```tsx
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  searchPlaceholder="Search…"
/>
```

---

## 9) Flow UX Singkat

1. User search → filter data (global).
2. User buka FilterModal → apply multi-filter.
3. User buka Column Visibility → toggle kolom.
4. Scroll tabel → infinite loader load more.

---

## 10) Checklist Implementasi (Wajib)

Gunakan checklist ini saat mem-porting ke proyek baru.

### Struktur & Komponen

- [ ] `DataTable` dipakai di semua page tabel
- [ ] `FilterModal` terhubung ke ikon filter
- [ ] `ColumnVisibilityDialog` terhubung ke ikon columns
- [ ] `useInfiniteScroll` aktif dan loader ada di dalam container scroll

### Layout & Scroll

- [ ] Container tabel punya `max-height` responsif + `overflow-auto`
- [ ] Header tabel `sticky top-0`
- [ ] Page tidak scroll jauh (scroll hanya di area tabel)

### Toolbar

- [ ] Input search di kiri, ikon menu di kanan
- [ ] Ikon filter & columns hanya icon (tanpa label)
- [ ] Hover icon mengikuti warna `#0F4C5C`

### Filter Modal

- [ ] Bisa tambah lebih dari 1 filter
- [ ] Kolom tidak bisa dipilih dua kali
- [ ] Reset benar-benar menghapus semua filter
- [ ] Apply menutup modal & menerapkan filter

### Column Visibility

- [ ] Toggle on/off bekerja
- [ ] Kolom wajib tidak bisa dimatikan
- [ ] Dialog compact (tidak besar)

### Style

- [ ] Header tabel warna `#F8FAFC`
- [ ] Row hover `#F8FAFC`
- [ ] Border utama `#E2E8F0`

---

## 11) Do / Don’t (Penting)

**Do**

- Gunakan `DataTable` untuk konsistensi fitur & style.
- Pastikan filter & column visibility berada di toolbar kanan.
- Pastikan sticky header tetap terlihat saat scroll.

**Don’t**

- Jangan buat tabel manual per halaman.
- Jangan gunakan scroll halaman untuk data tabel yang panjang.
- Jangan menaruh filter UI di area lain selain toolbar.

---

Jika ingin apply ke proyek baru, cukup copy:

- `DataTable`
- `FilterModal`
- `ColumnVisibilityDialog`
- `useInfiniteScroll`
- CSS/utility class sesuai di atas.
