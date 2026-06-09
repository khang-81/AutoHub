-- Chuẩn hóa đường dẫn KYC seed (uploads/kyc/*.pdf → kyc/*.png)
IF OBJECT_ID(N'dbo.user_documents', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[user_documents]
    SET [file_path] = REPLACE([file_path], N'uploads/kyc/', N'kyc/')
    WHERE [file_path] LIKE N'uploads/kyc/%';

    UPDATE [dbo].[user_documents]
    SET [file_path] = REPLACE([file_path], N'.pdf', N'.png')
    WHERE [file_path] LIKE N'%demo-%.pdf';
END;
