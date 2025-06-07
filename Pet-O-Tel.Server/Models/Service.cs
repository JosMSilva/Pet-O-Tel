using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models
{
    public class Service
    {

        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Slug { get; set; } = null!;

        public string? Description { get; set; }

        [Required]
        public string Icon { get; set; } = null!;

        [Required]
        public string Location { get; set; } = null!;

        [Required]
        public int Price { get; set; }

        public float Rating { get; set; }

        [Required]
        public int Type { get; set; }
    }
}
