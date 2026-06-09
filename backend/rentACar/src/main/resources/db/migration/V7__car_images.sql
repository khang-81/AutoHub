IF OBJECT_ID(N'dbo.car_images', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[car_images] (
        [id]          INT IDENTITY(1,1) NOT NULL,
        [car_id]      INT            NOT NULL,
        [image_url]   NVARCHAR(MAX)  NOT NULL,
        [sort_order]  SMALLINT       NOT NULL,
        [image_type]  NVARCHAR(16)   NOT NULL,
        CONSTRAINT [PK_car_images] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_car_images_cars] FOREIGN KEY ([car_id]) REFERENCES [dbo].[cars] ([id]) ON DELETE CASCADE,
        CONSTRAINT [CK_car_images_type] CHECK ([image_type] IN (N'EXTERIOR', N'INTERIOR'))
    );
    CREATE INDEX [IX_car_images_car_id] ON [dbo].[car_images]([car_id], [sort_order]);
END;
