using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ClientManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Clients",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ClientStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientStatuses", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ClientStatuses",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Client is active", "Active" },
                    { 2, "Client is inactive", "Inactive" },
                    { 3, "Client is pending approval", "Pending" },
                    { 4, "Client record has been archived", "Archived" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_StatusId",
                table: "Clients",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_ClientStatuses_StatusId",
                table: "Clients",
                column: "StatusId",
                principalTable: "ClientStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_ClientStatuses_StatusId",
                table: "Clients");

            migrationBuilder.DropTable(
                name: "ClientStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Clients_StatusId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Clients");
        }
    }
}
