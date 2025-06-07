using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models;

public class Users
{
    public int Id { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }

    public string? PasswordHash { get; set; }

    public string? FullName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Role { get; set; } = "User";

    public ICollection<UserLogins> Logins { get; set; } = new List<UserLogins>();
}