USE [TechPro]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[TPAGES](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dSlug] [nvarchar](50) NOT NULL,
    [dTitle] [nvarchar](255) NOT NULL,
    [dType] [nvarchar](50) NOT NULL,
    [dActive] [tinyint] NOT NULL DEFAULT 0,
    [dNotificationEmail] [nvarchar](255) NULL,
    [dCreated] [datetime] NULL,
    [dUpdated] [datetime] NULL
) ON [PRIMARY]
GO

PRINT 'TPAGES created.'
GO

CREATE TABLE [dbo].[TPAGES_COUNTRY](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dPageId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TPAGES](dId),
    [dCountry] [nvarchar](255) NOT NULL,
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[TPAGE_CONTENT](
    [dPageId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TPAGES](dId),
    [dLanguage] [nvarchar](50) NOT NULL DEFAULT 'ENG',
    [dDefault] [tinyint] NOT NULL DEFAULT 0,
    [dContent] [ntext] NULL,
    [dUpdated] [datetime] NULL
) ON [PRIMARY]
GO

PRINT 'TPAGE_CONTENT created.'
GO

CREATE TABLE [dbo].[TPAGE_REVISIONS](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dPageId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TPAGES](dId),
    [dLanguage] [nvarchar](50) NOT NULL DEFAULT 'ENG',
    [dContent] [ntext] NOT NULL,
    [dCreated] [datetime] NULL,
) ON [PRIMARY]
GO

PRINT 'TPAGE_REVISIONS created and connected to TPages.'
GO

CREATE TABLE [dbo].[TWIDGET_IMAGES](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dImageUrl] [nvarchar](255) NOT NULL,
    [dImageType] [nvarchar](40) NOT NULL DEFAULT 'main_widget',
    [dCreated] [datetime] NULL
) ON [PRIMARY]
GO

PRINT 'TWIDGET_IMAGES created.'
GO

CREATE TABLE [dbo].[TUSERS](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dLearnerId] [nvarchar](255) NOT NULL,
    [dSuperAdmin] [int] NOT NULL DEFAULT 0,
    [dCreated] [datetime] NULL
) ON [PRIMARY]
GO

PRINT 'TUSERS created.'
GO

CREATE TABLE [dbo].[TROLES](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dRole] [nvarchar](50) NOT NULL
) ON [PRIMARY]
GO

PRINT 'TROLES created'

CREATE TABLE [dbo].[TUSER_ROLES](
    [dId] [int] NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [dUserId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TUSERS](dId) ON DELETE CASCADE,
    [dRoleId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TROLES](dId) ON DELETE CASCADE,
    [dPageId] [int] NOT NULL FOREIGN KEY REFERENCES [dbo].[TPAGES](dId) ON DELETE CASCADE,
) ON [PRIMARY]
GO

PRINT 'TUSER_ROLES created'
GO
