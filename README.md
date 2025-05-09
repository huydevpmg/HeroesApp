
# HeroesApp

HeroesApp là một ứng dụng Angular quản lý danh sách anh hùng, hỗ trợ đăng ký, đăng nhập và cập nhật thông tin cá nhân. Ứng dụng sử dụng `ngRx` cho quản lý trạng thái và `JWT` cho xác thực người dùng.

## Tính năng

- Đăng ký & Đăng nhập người dùng sử dụng JWT.
- Quản lý danh sách anh hùng (thêm, sửa, xóa).
- Cập nhật thông tin người dùng.
- Validation form tùy chỉnh và Pipe cho tên.
- Quản lý tag cho anh hùng.
- Sử dụng ngRx để quản lý trạng thái.

## Cài đặt

1. Clone repo về máy:

   ```bash
   git clone https://github.com/your-username/heroes-app.git
   ```

2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

3. Chạy ứng dụng:

   ```bash
   ng serve
   ```

4. Mở trình duyệt tại `http://localhost:4200`.

## Các Module Chính

- **Core Module**: Chứa các service và interceptor cốt lõi.
- **Shared Module**: Chứa các component, pipe và validator dùng chung.
- **Heroes Module**: Quản lý danh sách anh hùng và các thao tác CRUD.
- **Auth Module**: Cung cấp chức năng đăng nhập và đăng ký.
- **Profile Module**: Cập nhật thông tin cá nhân người dùng.

## Công nghệ sử dụng

- Angular
- ngRx
- JWT
- Reactive Forms
- Angular Material
