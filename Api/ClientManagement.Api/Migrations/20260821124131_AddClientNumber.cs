using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClientManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientNumber",
                table: "Clients",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_ClientNumber",
                table: "Clients",
                column: "ClientNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clients_ClientNumber",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "ClientNumber",
                table: "Clients");
        }
    }
}
