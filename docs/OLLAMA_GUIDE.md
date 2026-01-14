# Hướng dẫn sử dụng Ollama (Offline AI)

Bạn đã cài đặt xong Ollama! Bây giờ hãy làm theo các bước sau để tải model về và chạy.

## 1. Tải Model (Llama 3)
Mở **Command Prompt (cmd)** hoặc **PowerShell** và chạy lệnh sau để tải model Llama 3 (nhẹ, nhanh, thông minh):

```bash
ollama run llama3
```

*Lưu ý: Lần đầu sẽ tốn chút thời gian để tải khoảng 4.7GB.*

Sau khi tải xong, bạn sẽ thấy dấu nhắc lệnh `>>>`. Bạn có thể chat thử "Hello". Gõ `/bye` để thoát.

## 2. Kiểm tra Server
Ollama thường chạy ngầm ở cổng 11434. Bạn có thể kiểm tra bằng cách mở trình duyệt và vào:
[http://localhost:11434](http://localhost:11434)
Nếu thấy "Ollama is running", là OK!

## 3. Cấu hình vào Project
Mình đã cập nhật file `.env` và code. Bạn chỉ cần đảm bảo `.env` có các dòng sau (mình sẽ tự thêm cho bạn):

```ini
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3
```

## 4. Chạy tool tạo nội dung
Bây giờ bạn có thể chạy tool như bình thường, nó sẽ tự động dùng Ollama trên máy bạn thay vì Groq.

```bash
node backend/generate_content.js
```
