using System.ComponentModel.DataAnnotations;

namespace Pet_O_Tel.Server.Models
{
    public class Booking
    {

        public int Id { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateOnly DateStart { get; set; }

        public DateOnly? DateEnd { get; set; }

        public TimeOnly? BookingTime { get; set; }

        public int Price { get; set; }

    }
}
