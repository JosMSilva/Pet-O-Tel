using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models
{
    public class ServiceType
    {

        public int Id { get; set; }

        [Required]
        public string Label { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        public string? Icon { get; set; }

    }
}
