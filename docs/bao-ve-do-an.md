# Tổng hợp nội dung bảo vệ đồ án AutoHub

## 1. Tổng quan dự án

Dự án AutoHub là một hệ thống web bán/thuê xe ô tô, kết hợp giữa giao diện người dùng và hệ thống quản trị. Mục tiêu chính là giúp khách hàng xem thông tin xe, đặt lịch xem xe, thực hiện thuê xe hoặc mua xe, đồng thời cung cấp cho admin công cụ quản lý xe, đơn hàng, khách hàng và báo cáo.

Dự án được xây dựng theo mô hình full-stack với:
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Spring Boot + Java 17 + Spring Security + JPA/Hibernate
- Database: SQL Server
- Deployment: Docker Compose + Nginx

---

## 2. Mục tiêu của hệ thống

### Mục tiêu nghiệp vụ
- Cho phép người dùng duyệt danh mục xe và thông tin chi tiết.
- Hỗ trợ khách hàng đăng ký, đăng nhập và quản lý tài khoản.
- Cho phép tạo đơn thuê xe, theo dõi đơn hàng và thanh toán.
- Hỗ trợ admin quản lý xe, màu sắc, thương hiệu, mẫu xe và khách hàng.
- Hỗ trợ nhập và xuất báo cáo, đánh giá xe.

### Mục tiêu kỹ thuật
- Xây dựng hệ thống có cấu trúc rõ ràng, dễ mở rộng.
- Áp dụng bảo mật cơ bản bằng JWT và phân quyền theo vai trò.
- Tách biệt frontend và backend để dễ phát triển và triển khai.
- Có khả năng chạy trên môi trường Docker, thuận tiện cho demo và bảo trì.

---

## 3. Kiến trúc hệ thống

### 3.1 Kiến trúc tổng thể
Hệ thống gồm 3 tầng chính:
1. Frontend: giao diện người dùng, gọi API.
2. Backend: xử lý nghiệp vụ, xác thực, phân quyền, truy vấn dữ liệu.
3. Database: lưu trữ thông tin người dùng, xe, đơn thuê, đơn bán, đánh giá.

### 3.2 Kiến trúc backend
Backend sử dụng cấu trúc theo lớp:
- Controller: tiếp nhận request từ frontend
- Service: xử lý nghiệp vụ
- Repository: giao tiếp với database
- Entity: ánh xạ dữ liệu sang bảng
- DTO: truyền dữ liệu giữa các lớp

Điểm mạnh của cách tổ chức này là:
- Dễ bảo trì
- Dễ mở rộng chức năng mới
- Tách biệt rõ ràng giữa logic và giao diện

---

## 4. Công nghệ chính sử dụng

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Zustand
- TanStack Query
- React Hook Form + Zod

### Backend
- Spring Boot 3
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Flyway
- OpenAPI / Swagger
- Mail service
- Actuator

### Cơ sở dữ liệu
- SQL Server 2022
- Có migration và schema riêng cho dữ liệu demo

---

## 5. Các chức năng chính

### 5.1 Chức năng người dùng
- Đăng ký, đăng nhập
- Xem danh mục xe
- Xem chi tiết xe
- Đặt lịch hẹn xem xe
- Thuê xe / đặt đơn hàng
- Theo dõi đơn hàng của mình
- Gửi đánh giá cho xe

### 5.2 Chức năng admin
- Quản lý xe, thương hiệu, màu sắc, mẫu xe
- Quản lý khách hàng và người dùng
- Duyệt / quản lý đơn thuê, đơn bán
- Quản lý hồ sơ KYC và tài liệu
- Xuất báo cáo
- Quản lý khuyến mãi và cấu hình thanh toán

---

## 6. Bảo mật trong hệ thống

Hệ thống có các biện pháp bảo mật cơ bản như sau:
- Dùng JWT để xác thực người dùng
- Phân quyền theo vai trò: user và admin
- Một số endpoint chỉ dành cho admin
- Filter xác thực JWT ở backend
- Có xử lý riêng cho file nhạy cảm như KYC

### Câu trả lời khi bảo vệ
> Bảo mật được triển khai ở mức phù hợp cho đồ án web thực tế: xác thực bằng JWT, phân quyền theo vai trò, và kiểm soát truy cập ở backend thay vì chỉ dựa vào giao diện.

---

## 7. Quy trình nghiệp vụ chính

### 7.1 Quy trình thuê xe
1. Người dùng chọn xe
2. Hệ thống hiển thị thông tin và khoảng thời gian khả dụng
3. Người dùng đặt lịch / tạo đơn thuê
4. Backend kiểm tra điều kiện hợp lệ
5. Hệ thống lưu đơn và tạo hóa đơn hoặc thông tin liên quan

### 7.2 Quy trình quản lý admin
1. Admin đăng nhập
2. Admin quản lý danh mục xe và đơn hàng
3. Admin kiểm tra trạng thái đơn
4. Admin có thể xuất báo cáo hoặc cập nhật trạng thái

---

## 8. Điểm mạnh của đồ án

- Có đầy đủ các thành phần của một hệ thống web thực tế
- Có phân quyền rõ ràng
- Có backend và frontend tách biệt
- Có tích hợp database và deployment Docker
- Có thể demo được đầy đủ luồng nghiệp vụ

---

## 9. Điểm cần cải thiện

- Có thể bổ sung thanh toán trực tuyến thực tế thay vì luồng chuyển khoản thủ công
- Có thể tăng cường kiểm tra ràng buộc nghiệp vụ như trùng lịch thuê, giới hạn số lượng xe
- Có thể thêm test automation và CI/CD
- Có thể cải thiện UX cho trang admin

---

## 10. Câu hỏi thường gặp khi bảo vệ và gợi ý trả lời

### Câu 1: Dữ liệu của hệ thống được lưu ở đâu?
Trả lời gợi ý:
- Dữ liệu chính được lưu trong SQL Server.
- Backend kết nối tới database thông qua Spring Data JPA và Hibernate.
- File cấu hình kết nối nằm ở [backend/rentACar/src/main/resources/application.properties](backend/rentACar/src/main/resources/application.properties).
- Trong project có các repository như [backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/UserRepository.java](backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/UserRepository.java), [backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/CarRepository.java](backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/CarRepository.java), [backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/RentalRepository.java](backend/rentACar/src/main/java/com/tobeto/rentACar/repositories/RentalRepository.java) để thao tác dữ liệu.

### Câu 2: Dữ liệu được lưu theo hình thức nào?
Trả lời gợi ý:
- Dữ liệu được lưu theo mô hình quan hệ (relational database).
- Mỗi entity tương ứng với một bảng, ví dụ User, Car, Rental, Review, SaleOrder.
- Các file entity nằm ở thư mục [backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes](backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes).
- Hibernate sẽ ánh xạ các entity này sang bảng trong SQL Server.

### Câu 3: Có những loại dữ liệu nào trong hệ thống?
Trả lời gợi ý:
- Dữ liệu người dùng: tài khoản, vai trò, thông tin đăng nhập.
- Dữ liệu xe: thương hiệu, model, màu sắc, giá, trạng thái.
- Dữ liệu giao dịch: đơn thuê, hóa đơn, đơn bán, khuyến mãi.
- Dữ liệu phụ: đánh giá, lịch hẹn xem xe, hồ sơ KYC, hình ảnh xe.

### Câu 4: File nào là nơi định nghĩa cấu trúc dữ liệu?
Trả lời gợi ý:
- File entity định nghĩa cấu trúc dữ liệu, ví dụ [backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/User.java](backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/User.java), [backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/Car.java](backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/Car.java), [backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/Rental.java](backend/rentACar/src/main/java/com/tobeto/rentACar/entities/concretes/Rental.java).
- File repository dùng để thao tác với dữ liệu.
- File controller và service xử lý nghiệp vụ trước khi lưu hoặc đọc dữ liệu.

### Câu 5: Dữ liệu file upload như ảnh, giấy tờ KYC được lưu ở đâu?
Trả lời gợi ý:
- File upload được lưu trong thư mục uploads trên server.
- Cấu hình thư mục này nằm trong [backend/rentACar/src/main/resources/application.properties](backend/rentACar/src/main/resources/application.properties).
- Metadata của file như tên, loại, trạng thái duyệt sẽ được lưu trong database.
- Khi deploy lên VPS bằng Docker, các file upload không nằm trực tiếp trong code mà được mount vào volume Docker tên uploads_data, nên dữ liệu vẫn còn khi container restart hoặc được rebuild.

### Câu 6: Nếu deploy lên VPS thì dữ liệu có lưu trên VPS không?
Trả lời gợi ý:
- Có. Khi deploy lên VPS bằng Docker, dữ liệu chính được lưu trên VPS thông qua các Docker volumes.
- CSDL SQL Server lưu dữ liệu trong volume mssql_data, tương ứng với thư mục /var/opt/mssql bên trong container SQL Server.
- File upload lưu trong volume uploads_data, tương ứng với thư mục /app/uploads bên trong container API.
- Vì vậy, dù container bị restart hoặc rebuild, dữ liệu vẫn có thể được giữ lại nếu volume không bị xóa.

### Câu 7: Dữ liệu được lưu như thế nào trên VPS?
Trả lời gợi ý:
- Dữ liệu cấu trúc như người dùng, xe, đơn hàng được lưu trong SQL Server.
- Dữ liệu không cấu trúc như ảnh, tài liệu được lưu dưới dạng file trên hệ thống file của VPS.
- Database chỉ lưu thông tin tham chiếu đến file đó, ví dụ đường dẫn, tên file, trạng thái duyệt.
- Cách lưu này giúp tách riêng dữ liệu quan hệ và dữ liệu tài nguyên.

### Câu 8: Có những chỗ lưu dữ liệu nào trong project?
Trả lời gợi ý:
- CSDL: SQL Server, thông qua Docker volume mssql_data.
- File upload: thư mục uploads, thông qua Docker volume uploads_data.
- Cấu hình triển khai nằm ở [docker-compose.yml](docker-compose.yml).
- Đây là hai nơi lưu dữ liệu chính của hệ thống khi chạy trên VPS.

### Câu 6: Có dùng migration không?
Trả lời gợi ý:
- Có, hệ thống dùng Flyway để quản lý migration.
- Ví dụ file migration nằm ở [backend/rentACar/src/main/resources/db/migration/V1__add_performance_indexes.sql](backend/rentACar/src/main/resources/db/migration/V1__add_performance_indexes.sql).
- Điều này giúp schema dễ quản lý và mở rộng.

### Câu 7: Nếu bị hỏi về điểm yếu liên quan dữ liệu thì nên nói gì?
Trả lời gợi ý:
- Hiện hệ thống đã có lưu trữ dữ liệu theo mô hình quan hệ và có phân tách rõ giữa dữ liệu nghiệp vụ và file upload.
- Tuy nhiên, vẫn có thể cải thiện thêm về kiểm soát dữ liệu, backup, validation nghiệp vụ và tối ưu truy vấn.

### Câu 8: Vì sao không lưu dữ liệu trực tiếp ở frontend?
Trả lời gợi ý:
- Frontend chỉ chịu trách nhiệm hiển thị và gửi request.
- Dữ liệu quan trọng cần được lưu ở backend và database để đảm bảo an toàn, nhất quán và dễ kiểm soát.
- Nếu lưu ở frontend thì dễ bị chỉnh sửa hoặc mất dữ liệu.

### Câu 9: Vì sao dùng database thay vì lưu JSON hoặc file text?
Trả lời gợi ý:
- Với dữ liệu có cấu trúc như user, xe, đơn hàng, thì database quan hệ phù hợp hơn.
- Database giúp truy vấn, liên kết dữ liệu, bảo toàn tính toàn vẹn và dễ mở rộng.

### Câu 10: Nếu giảng viên phản biện hỏi về backup và bảo mật dữ liệu?
Trả lời gợi ý:
- Dữ liệu được lưu trong database có thể được backup và restore.
- Các thông tin nhạy cảm như mật khẩu và token được xử lý ở backend.
- Có thể bổ sung thêm backup tự động, mã hóa dữ liệu nhạy cảm và logging audit trong phiên bản phát triển tiếp theo.

### Câu 11: Vì sao lại dùng JPA/Hibernate?
Trả lời gợi ý:
- JPA/Hibernate giúp giảm công việc viết SQL thủ công.
- Cho phép ánh xạ object sang database một cách trực quan.
- Hỗ trợ CRUD nhanh và dễ bảo trì.

### Câu 12: Nếu bị hỏi về dữ liệu và hiệu năng?
Trả lời gợi ý:
- Với quy mô đồ án, cấu trúc hiện tại đủ dùng.
- Nếu mở rộng lớn hơn, có thể tối ưu bằng index, phân trang, caching và tối ưu truy vấn.

### Câu 1: Vì sao chọn Spring Boot cho backend?
Trả lời gợi ý:
- Spring Boot giúp phát triển API nhanh và dễ quản lý.
- Hỗ trợ nhiều tính năng sẵn có như security, JPA, validation, mail, swagger.
- Phù hợp với đồ án vì giảm thời gian cấu hình và tập trung vào logic nghiệp vụ.

### Câu 2: Vì sao chọn React cho frontend?
Trả lời gợi ý:
- React phù hợp cho giao diện động và component-based.
- Dễ quản lý trạng thái và tái sử dụng component.
- Kết hợp Vite giúp tốc độ dev nhanh và hiệu quả.

### Câu 3: Hệ thống có bảo mật không?
Trả lời gợi ý:
- Có sử dụng JWT để xác thực người dùng.
- Có phân quyền theo vai trò user/admin.
- Các thao tác nhạy cảm được kiểm soát ở backend.

### Câu 4: Dữ liệu được lưu như thế nào?
Trả lời gợi ý:
- Dữ liệu được lưu trong SQL Server thông qua JPA/Hibernate.
- Có thể dùng migration và schema để quản lý dữ liệu một cách có tổ chức.

### Câu 5: Vì sao hệ thống có cả user và admin?
Trả lời gợi ý:
- Vì hệ thống phục vụ hai nhóm người dùng khác nhau: khách hàng và quản trị viên.
- Người dùng cần giao diện đơn giản để thao tác đặt xe, còn admin cần giao diện quản trị và báo cáo.

### Câu 6: Điểm khác biệt của đồ án so với một trang web bán hàng thông thường là gì?
Trả lời gợi ý:
- Đây không chỉ là website bán hàng đơn thuần, mà là hệ thống kết hợp quản lý xe, lịch thuê, đơn hàng, khách hàng và admin.
- Vì vậy đồ án có tính nghiệp vụ rõ ràng và gần với hệ thống thực tế hơn.

### Câu 7: Nếu được tiếp tục phát triển, bạn sẽ cải thiện gì?
Trả lời gợi ý:
- Bổ sung thanh toán online và tích hợp cổng thanh toán.
- Tăng cường kiểm soát nghiệp vụ và tối ưu trải nghiệm admin.
- Thêm test và CI/CD để nâng cao độ tin cậy.

---

## 11. Mẫu trả lời ngắn cho phần giới thiệu bảo vệ

> Đề tài của em là xây dựng hệ thống web AutoHub phục vụ cho việc quản lý và đặt thuê/mua xe ô tô. Hệ thống gồm frontend và backend tách riêng, frontend dùng React và backend dùng Spring Boot. Em triển khai các chức năng chính như đăng nhập, quản lý xe, đặt thuê, quản lý đơn hàng và phân quyền cho admin. Ngoài ra, em cũng áp dụng JWT để bảo mật và Docker để triển khai hệ thống dễ dàng hơn.

---

## 12. Gợi ý cách trình bày khi bảo vệ

- Nói ngắn gọn, rõ mục tiêu trước khi đi vào chi tiết.
- Trình bày theo luồng: vấn đề -> giải pháp -> công nghệ -> kết quả.
- Khi bị hỏi về điểm yếu, nên thừa nhận và nói cách cải thiện.
- Luôn liên hệ với thực tế: hệ thống này giống một sản phẩm web doanh nghiệp hơn là demo tĩnh.

---

## 13. Kết luận

Đồ án AutoHub thể hiện được khả năng xây dựng một hệ thống web đầy đủ từ frontend, backend, database đến deployment. Đây là một sản phẩm có giá trị về mặt học thuật và có thể phát triển tiếp thành hệ thống thực tế.
