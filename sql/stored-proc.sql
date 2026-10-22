USE [TechPro]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--- PAGES
--- Select GEO Slug Type
CREATE PROCEDURE  SelectGeoPageBySlug
	@Slug nvarchar(50),
    @Type nvarchar(50) = 'geo'
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * 
    FROM dbo.TPAGES 
    WHERE dSlug = @Slug AND dType = @Type
END
GO

--- Select GEO By ID
CREATE PROCEDURE  SelectGeoById
	@ID int
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * 
    FROM dbo.TPAGES 
    WHERE dId = @ID
END
GO

-- Select GEO Page for Public viewing
CREATE PROCEDURE SelectGeoPagePublic
    @PageId int,
    @Language nvarchar(50) = 'ENG'
AS
BEGIN
    SELECT *
    FROM dbo.TPAGE_CONTENT
    WHERE dPageId = @PageId AND dLanguage = @Language
END
GO

--- Insert GEO Page
CREATE PROCEDURE InsertGeoPage
    @Slug nvarchar(50),
    @Title nvarchar(255),
    @Active tinyint
AS
BEGIN
    INSERT INTO dbo.TPAGES 
    (dSlug, dTitle, dType, dActive, dCreated, dUpdated)
    VALUES 
    (@Slug, @Title, 'geo', @Active, GETDATE(),GETDATE());
    
    DECLARE @PageId INT;
    SELECT @PageId = SCOPE_IDENTITY();

    INSERT INTO dbo.TPAGE_CONTENT
    (dPageId, dLanguage, dDefault, dUpdated)
    VALUES
    (@PageId, 'ENG', 1, GETDATE());
END
GO

--- Update GEO Page
CREATE PROCEDURE UpdateGeoPageAdmin
    @ID int,
    @Slug nvarchar(50),
    @Title nvarchar(255),
    @Active tinyint
AS
BEGIN
    UPDATE dbo.TPAGES SET
        dSlug = @Slug,
        dTitle = @Title,
        dActive = @Active,
        dUpdated = GETDATE()
    WHERE dId = @ID
END
GO

-- Delete GEO Page
-- LEAVING FOR NOW

-- Adding a new Page Revision
CREATE PROCEDURE InsertGeoPageRevision
    @PageId int,
    @Content ntext,
    @Language nvarchar(50) = 'ENG'
AS
BEGIN
    INSERT INTO dbo.TPAGE_REVISIONS 
    (dPageId, dLanguage, dContent, dCreated)
    VALUES
    (@PageId, @Language, @Content, GETDATE());
END
GO

-- Publishing a revision to a page
CREATE PROCEDURE PublishGeoPage
    @PageId int,
    @Content ntext,
    @Language nvarchar(50) = 'ENG'
AS
BEGIN
    UPDATE dbo.TPAGE_CONTENT SET 
    dContent = @Content, dUpdated = GETDATE()
    WHERE dPageId = @PageId AND dLanguage = @Language
END
GO
    
-- USERS

-- Insert New User
-- TODO: QUERY TO "look up" the learner I do not have at this time.


-- TODO: Select users role for given page
-- 

-- Remove User
CREATE PROCEDURE CMSRemoveUser
    @UserId int
AS
BEGIN
    DELETE FROM dbo.TUSERS WHERE dId = @UserId;
END
GO

-- Grab Roles
CREATE PROCEDURE CMSUserRoles
AS
BEGIN
    SELECT *
    FROM dbo.TROLES
    ORDER BY dRole ASC
END
GO

-- Assign a user to a role for a page
CREATE PROCEDURE CMSAssignRoleToUser
    @UserId int,
    @RoleId int,
    @PageId int
AS
BEGIN
    INSERT INTO dbo.TUSER_ROLES
    (dUserId, dRoleId, dPageId)
    VALUES
    (@UserId, @RoleId, @PageId);
END
