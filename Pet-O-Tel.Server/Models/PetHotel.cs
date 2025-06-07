using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models
{
    public class PetHotel
    {

        public int Id { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public int Bedrooms { get; set; }

        public string? Amenities { get; set; }


    }
}
