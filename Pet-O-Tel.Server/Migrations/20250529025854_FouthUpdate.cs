using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pet_O_Tel.Server.Migrations
{
    /// <inheritdoc />
    public partial class FouthUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Services",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Services");
        }
    }
}
