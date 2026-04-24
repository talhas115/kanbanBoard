using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeFlow.KanbanBoard.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectLayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Projects table
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Key = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // 2. Add ProjectId to Tasks as nullable initially
            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "Tasks",
                type: "uuid",
                nullable: true);

            // 3. Insert a Default Project using an existing user
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    default_user_id UUID;
                    default_project_id UUID := '00000000-0000-0000-0000-000000000001';
                BEGIN
                    SELECT ""Id"" INTO default_user_id FROM ""Users"" LIMIT 1;
                    
                    IF default_user_id IS NOT NULL THEN
                        INSERT INTO ""Projects"" (""Id"", ""Name"", ""Key"", ""Description"", ""CreatedAt"", ""OwnerId"")
                        VALUES (default_project_id, 'Default Project', 'DEFT', 'Auto-generated for existing tasks', NOW(), default_user_id);
                        
                        UPDATE ""Tasks"" SET ""ProjectId"" = default_project_id WHERE ""ProjectId"" IS NULL;
                    END IF;
                END $$;
            ");

            // 4. Make ProjectId non-nullable now that data is populated
            migrationBuilder.AlterColumn<Guid>(
                name: "ProjectId",
                table: "Tasks",
                type: "uuid",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OwnerId",
                table: "Projects",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Projects_ProjectId",
                table: "Tasks",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Projects_ProjectId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_ProjectId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Tasks");
        }
    }
}
