# 🚀 PDF to Database Importer - HƯỚNG DẪN NHANH

## ✨ Phương Án TỐT NHẤT - Import Trực Tiếp từ PDF vào Database

**Không cần JSON trung gian! Chỉ 3 bước đơn giản:**

### Bước 1: Cài đặt Python libraries

```powershell
cd "c:\laragon\www\App ielts\tools"
pip install -r requirements.txt
```

### Bước 2: Đảm bảo Backend .env đã cấu hình

File `backend\.env` phải có đầy đủ thông tin database.

### Bước 3: Chạy script

```powershell
python pdf_to_database.py
```

Nhập đường dẫn file PDF khi được hỏi, ví dụ:
```
C:\Users\DELL\Documents\3000-ielts-words.pdf
```

**Script sẽ tự động:**
- ✅ Đọc toàn bộ PDF
- ✅ Parse thông minh (nhận diện từ, định nghĩa, ví dụ)
- ✅ Import trực tiếp vào MySQL
- ✅ Hiển thị tiến trình từng 100 từ
- ✅ Báo cáo kết quả cuối cùng

---

## 🎯 Script Thông Minh Nhận Diện:

1. **Từ vựng**: Dòng chỉ chứa 1 từ tiếng Anh
2. **Loại từ**: noun, verb, adjective, adverb (hoặc viết tắt)
3. **Phiên âm**: Text trong dấu `/.../ `
4. **Định nghĩa**: Câu dài giải thích nghĩa
5. **Ví dụ**: Câu có "e.g.", "Example:", hoặc trong dấu ngoặc kép
6. **Từ đồng nghĩa**: Dòng có "Synonym:", "Similar:"

---

## ⚙️ Xử Lý Lỗi

### Nếu script không parse đúng:

1. Kiểm tra file `extracted_raw_text.txt` được tạo ra
2. Xem format của PDF
3. Gửi cho tôi 5-10 dòng mẫu, tôi sẽ điều chỉnh parser

### Nếu kết nối database lỗi:

- Kiểm tra MySQL đang chạy (Laragon)
- Kiểm tra database `ielts_vocabulary` đã tạo chưa
- Kiểm tra thông tin trong `backend\.env`

---

## 🔧 Các Cách Khác (Dự Phòng)

### Cách 2: PDF → Excel → JSON

1. Dùng Adobe Acrobat hoặc https://www.ilovepdf.com/pdf_to_excel
2. Chuyển PDF sang Excel
3. Format trong Excel
4. Export to CSV
5. Dùng https://csvjson.com/ chuyển sang JSON
6. Import JSON qua Postman

### Cách 3: Copy thủ công từng phần

Nếu PDF quá phức tạp, có thể:
1. Copy từng 100 từ
2. Paste vào ChatGPT/Claude để format
3. Ghép lại các phần

---

## 📊 Kiểm Tra Kết Quả

Sau khi import, kiểm tra trong database:

```sql
SELECT COUNT(*) FROM vocabularies;
SELECT * FROM vocabularies LIMIT 10;
```

Hoặc test qua API:
```
http://localhost:3000/vocabulary/search?q=test
```
