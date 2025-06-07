using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models;

public class UserLogins
{
    public int Id { get; set; }

    [Required]
    public string Provider { get; set; } = null!;

    [Required]
    public string ProviderKey { get; set; } = null!;

    public string? DisplayName { get; set; }

    public int UserId { get; set; }
    public Users User { get; set; } = null!;
}