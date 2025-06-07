using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pet_O_Tel.Server.Data;
using Pet_O_Tel.Server.Models;

namespace Pet_O_Tel.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class ServiceController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServiceController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("clear")]
    public async Task<IActionResult> ClearDatabase()
    {
        var allServices = await _db.Services.ToListAsync();

        _db.Services.RemoveRange(allServices);

        await _db.SaveChangesAsync();

        return Ok("Database cleared.");
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedDatabase()
    {
        
        if (!await _db.Services.AnyAsync())
        {
            
            var servicesList = GetSeedServices(); 
            _db.Services.AddRange(servicesList);
            await _db.SaveChangesAsync();
        }

        return Ok("Database seeded.");
    }

    [HttpPost("seed1")]
    public async Task<IActionResult> SeedDatabase1()
    {

        if (!await _db.Services.AnyAsync())
        {

            var servicesList = new List<Service>{ new Service { Name = "Tail Wag Retreat", Slug = "tailwagretreat", Description = "Safe, clean, and cozy overnight lodging for dogs and cats.", Icon = "Hotel1.jpg", Location = "Lisboa", Price = 145, Rating = 4.5f, Type = 1 } };
            _db.Services.AddRange(servicesList);
            await _db.SaveChangesAsync();

            var slug = "tailwagretreat"; 

            var service = await _db.Services
                .FirstOrDefaultAsync(s => s.Slug == slug);


            var petHotels = new List<PetHotel>
            {
                new PetHotel { ServiceId = service.Id, Amenities = "24/7 supervision, outdoor play area, grooming services", Bedrooms = 5 }
            };
            _db.PetHotel.AddRange(petHotels);
            await _db.SaveChangesAsync();
        }

        return Ok("Database seeded.");
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<ServiceType>>> GetAll()
    {
        
        if (!await _db.ServiceTypes.AnyAsync())
        {
            var defaults = new List<ServiceType>
            {
                new() { Label = "Pet Hotel",   Description = "Safe and cozy places for pets to stay overnight or longer.",Icon = "PetHotel.png"   },
                new() { Label = "Pet Walking", Description = "Professional pet walkers to keep your dog active and happy.",Icon = "PetWalking.png" },
                new() { Label = "Pet Sitting", Description = "Experienced sitters who care for your pets at your home.",Icon = "PetSitting.png" },
                new() { Label = "Pet Daycare", Description = "Daytime care with play, feeding, and cuddles while you’re away.",Icon = "PetDaycare.png" },
                new() { Label = "Pet Health",  Description = "Basic wellness services like grooming, medication, and vet checks.",Icon = "PetCare.png"    }
            };

            _db.ServiceTypes.AddRange(defaults);
            await _db.SaveChangesAsync();
        }

        var services = await _db.ServiceTypes.AsNoTracking().ToListAsync();
        return Ok(services);
    }

    [HttpGet("list")]
    public async Task<ActionResult<IEnumerable<Service>>> GetServices()
    {
        var services = await _db.Services.AsNoTracking().ToListAsync();
        return Ok(services);
    }


    [HttpGet("{slug}")]
    public async Task<ActionResult<Service>> GetServiceBySlug(string slug)
    {
        var service = await _db.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Slug == slug);

        if (service == null)
        {
            return NotFound($"No service found with slug '{slug}'.");
        }

        return Ok(service);
    }

    [HttpPost("add")]
    public async Task<IActionResult> CreateService([FromBody] ServiceDto dto)
    {
        var newService = new Service
        {
            Name = dto.Name ?? throw new ArgumentNullException(nameof(dto.Name), "Name is required."),
            Slug = dto.Slug ?? throw new ArgumentNullException(nameof(dto.Slug), "Slug is required."),
            Description = dto.Description,
            Icon = "Walk1.jpg",
            Location = dto.Location ?? throw new ArgumentNullException(nameof(dto.Location), "Location is required."),
            Price = dto.Price ?? throw new ArgumentNullException(nameof(dto.Price), "Price is required."),
            Rating = dto.Rating ?? 0, // Default to 0 if not provided
            Type = dto.Type ?? throw new ArgumentNullException(nameof(dto.Type), "Type is required.")
        };

        Console.WriteLine($"Creating service: {newService.Name}, Slug: {newService.Slug}");

        try
        {
            // Optional: Check for duplicate slug
            var exists = await _db.Services.AnyAsync(s => s.Slug == newService.Slug);
            if (exists)
            {
                return Conflict($"A service with slug '{newService.Slug}' already exists.");
            }

            _db.Services.Add(newService);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServiceBySlug), new { slug = newService.Slug }, newService);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }


    public class ServiceDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public string? Location { get; set; }
        public int? Price { get; set; }
        public float? Rating { get; set; }
        public int? Type { get; set; }
    }

    private List<Service> GetSeedServices()
    {
        return new List<Service>
        {
            new Service { Name = "Tail Wag Retreat", Slug = "tailwagretreat", Description = "Safe, clean, and cozy overnight lodging for dogs and cats.", Icon = "Hotel1.jpg", Location = "Lisboa", Price = 145, Rating = 4.5f, Type = 1 },
            new Service { Name = "Urban Tails", Slug = "urbantails", Description = "Outdoor adventures that your dog will love and look forward to.", Icon = "Walk1.jpg", Location = "Porto", Price = 67, Rating = 4.3f, Type = 2 },
            new Service { Name = "In-Home Hugs", Slug = "inhomehugs", Description = "Keep your pets happy at home with expert companionship.", Icon = "Sitting1.jpg", Location = "Faro", Price = 92, Rating = 4.8f, Type = 3 },
            new Service { Name = "Happy Tails HQ", Slug = "happytailshq", Description = "Where pets spend the day having fun, socializing, and relaxing.", Icon = "Daycare1.jpg", Location = "Braga", Price = 104, Rating = 4.7f, Type = 4 },
            new Service { Name = "Fur Wellness", Slug = "furwellness", Description = "Gentle care that keeps your pet clean and feeling great.", Icon = "Care1.jpg", Location = "Setúbal", Price = 75, Rating = 4.4f, Type = 5 },

            new Service { Name = "Fur Seasons", Slug = "furseasons", Description = "Tail-wagging comfort for your pet while you're away.", Icon = "Hotel2.jpg", Location = "Aveiro", Price = 130, Rating = 4.6f, Type = 1 },
            new Service { Name = "Daily Stride", Slug = "dailystride", Description = "Fun and stimulating walks led by caring professionals.", Icon = "Walk2.jpg", Location = "Viseu", Price = 55, Rating = 4.2f, Type = 2 },
            new Service { Name = "Comfort Companions", Slug = "comfortcompanions", Description = "Trustworthy sitters who care for your pets in their own space.", Icon = "Sitting2.jpg", Location = "Viana do Castelo", Price = 80, Rating = 4.9f, Type = 3 },
            new Service { Name = "The Pet Den", Slug = "thepetden", Description = "Play, nap, repeat – a joyful daycare for dogs and cats.", Icon = "Daycare2.jpg", Location = "Leiria", Price = 115, Rating = 4.6f, Type = 4 },
            new Service { Name = "The Pet Medic", Slug = "thepetmedic", Description = "Basic health services like grooming, checkups, and medication.", Icon = "Care2.jpg", Location = "Beja", Price = 85, Rating = 4.5f, Type = 5 },

            new Service { Name = "Whisker Inn", Slug = "whiskerinn", Description = "A premium stay for furry friends with round-the-clock care.", Icon = "Hotel3.jpg", Location = "Madeira", Price = 150, Rating = 4.7f, Type = 1 },
            new Service { Name = "Leash Legends", Slug = "leashlegends", Description = "Heroic walkers for your energetic four-legged pal.", Icon = "Walk3.jpg", Location = "Santarém", Price = 60, Rating = 4.6f, Type = 2 },
            new Service { Name = "Sofa Snugglers", Slug = "sofasnugglers", Description = "Home pet sitting with extra warmth and cuddles.", Icon = "Sitting3.jpg", Location = "Açores", Price = 100, Rating = 4.8f, Type = 3 },
            new Service { Name = "Daytail Club", Slug = "daytailclub", Description = "Interactive daycare where every tail wags all day.", Icon = "Daycare3.jpg", Location = "Guarda", Price = 110, Rating = 4.4f, Type = 4 },
            new Service { Name = "Pawsitive Health", Slug = "pawsitivehealth", Description = "Wellness checks and care for lifelong vitality.", Icon = "Care3.jpg", Location = "Portalegre", Price = 78, Rating = 4.7f, Type = 5 },

            new Service { Name = "Cozy Kennels", Slug = "cozykennels", Description = "Home away from home for cats and dogs alike.", Icon = "Hotel4.jpg ", Location = "Évora", Price = 135, Rating = 4.5f, Type = 1 },
            new Service { Name = "Stride Squad", Slug = "stridesquad", Description = "Join the daily pack walk with trained handlers.", Icon = "Walk4.jpg", Location = "Castelo Branco", Price = 59, Rating = 4.3f, Type = 2 },
            new Service { Name = "Stay Pawsitive", Slug = "staypawsitive", Description = "Reliable sitting service that brings joy home.", Icon = "Sitting4.jpg", Location = "Bragança", Price = 90, Rating = 4.9f, Type = 3 },
            new Service { Name = "Bark & Play", Slug = "barkandplay", Description = "Where dogs spend their day in games and snuggles.", Icon = "Daycare4.jpg", Location = "Coimbra", Price = 108, Rating = 4.6f, Type = 4 },
            new Service { Name = "VitaPets", Slug = "vitapets", Description = "Proactive health services for your pets' best life.", Icon = "Care4.jpg", Location = "Vila Real", Price = 80, Rating = 4.8f, Type = 5 },

            new Service { Name = "Pet Palace", Slug = "petpalace", Description = "Luxury lodging for pampered pets of all kinds.", Icon = "Hotel5.jpg", Location = "Lisboa", Price = 160, Rating = 4.9f, Type = 1 },
            new Service { Name = "Trail Trotters", Slug = "trailtrotters", Description = "Nature trail walks for high-energy pups.", Icon = "Walk5.jpg", Location = "Porto", Price = 70, Rating = 4.5f, Type = 2 },
            new Service { Name = "Guardian Paws", Slug = "guardianpaws", Description = "In-home supervision by trained and loving sitters.", Icon = "Sitting5.jpg", Location = "Faro", Price = 98, Rating = 4.7f, Type = 3 },
            new Service { Name = "Sniff & Snooze", Slug = "sniffandsnooze", Description = "A calm daycare for older and shy pets.", Icon = "Daycare5.jpg", Location = "Braga", Price = 102, Rating = 4.5f, Type = 4 },
            new Service { Name = "Healthy Whiskers", Slug = "healthywhiskers", Description = "Routine wellness and preventative services for pets.", Icon = "Care5.jpg", Location = "Setúbal", Price = 88, Rating = 4.6f, Type = 5 },

            new Service { Name = "Mutt Manor", Slug = "muttmanor", Description = "Spacious, fun, and caring hotel for all dog breeds.", Icon = "Hotel1.jpg", Location = "Aveiro", Price = 142, Rating = 4.4f, Type = 1 },
            new Service { Name = "Walk This Way", Slug = "walkthisway", Description = "Neighborhood walks with attentive staff.", Icon = "Walk1.jpg", Location = "Viseu", Price = 62, Rating = 4.3f, Type = 2 },
            new Service { Name = "House of Paws", Slug = "houseofpaws", Description = "Home-based pet care when you're out or traveling.", Icon = "Sitting1.jpg", Location = "Viana do Castelo", Price = 87, Rating = 4.7f, Type = 3 },
            new Service { Name = "Playful Pack", Slug = "playfulpack", Description = "Supervised group play and enrichment activities.", Icon = "Daycare1.jpg", Location = "Leiria", Price = 109, Rating = 4.8f, Type = 4 },
            new Service { Name = "WellPet Express", Slug = "wellpetexpress", Description = "Express checkups and grooming for busy owners.", Icon = "Care1.jpg", Location = "Beja", Price = 72, Rating = 4.6f, Type = 5 },
            new Service { Name = "Cozy Paw Lodge", Slug = "cozypawlodge", Description = "Comfortable overnight stays for your furry family.", Icon = "Hotel5.jpg", Location = "Coimbra", Price = 140, Rating = 4.6f, Type = 1 },
            new Service { Name = "Leash & Lounge", Slug = "leashlounge", Description = "Relaxed dog walks with experienced handlers.", Icon = "Walk5.jpg", Location = "Leiria", Price = 60, Rating = 4.4f, Type = 2 },
            new Service { Name = "Guardian Tails", Slug = "guardiantails", Description = "Pet sitters who provide care and comfort at home.", Icon = "Sitting5.jpg", Location = "Viseu", Price = 95, Rating = 4.7f, Type = 3 },
            new Service { Name = "Waggy World", Slug = "waggyworld", Description = "A safe and exciting daycare for dogs of all sizes.", Icon = "Daycare5.jpg", Location = "Porto", Price = 112, Rating = 4.8f, Type = 4 },
            new Service { Name = "Gentle Vets", Slug = "gentlevets", Description = "Routine pet care and basic wellness by professionals.", Icon = "Care5.jpg", Location = "Aveiro", Price = 77, Rating = 4.5f, Type = 5 },

            new Service { Name = "Meow Manor", Slug = "meowmanor", Description = "Luxury cat boarding with purrfect privacy.", Icon = "Hotel2.jpg", Location = "Coimbra", Price = 125, Rating = 4.6f, Type = 1 },
            new Service { Name = "Trail Tails", Slug = "trailtails", Description = "Adventurous forest and trail walks for energetic pups.", Icon = "Walk2.jpg", Location = "Leiria", Price = 65, Rating = 4.3f, Type = 2 },
            new Service { Name = "Stay Purrfect", Slug = "staypurrfect", Description = "In-home sitting that keeps your cats calm and loved.", Icon = "Sitting2.jpg", Location = "Viseu", Price = 88, Rating = 4.8f, Type = 3 },
            new Service { Name = "Happy Paws Place", Slug = "happypawsplace", Description = "Joyful daycare with social time and cozy naps.", Icon = "Daycare2.jpg", Location = "Porto", Price = 105, Rating = 4.6f, Type = 4 },
            new Service { Name = "Vet to Paw", Slug = "vettopaw", Description = "Mobile wellness and grooming for convenience.", Icon = "Care2.jpg", Location = "Aveiro", Price = 82, Rating = 4.7f, Type = 5 },

            new Service { Name = "Barkstay", Slug = "barkstay", Description = "Premium kennels with attention and outdoor time.", Icon = "Hotel3.jpg", Location = "Leiria", Price = 135, Rating = 4.5f, Type = 1 },
            new Service { Name = "Fetch & Stroll", Slug = "fetchstroll", Description = "Light exercise and fun for your best friend.", Icon = "Walk3.jpg", Location = "Coimbra", Price = 58, Rating = 4.2f, Type = 2 },
            new Service { Name = "Peaceful Paws", Slug = "peacefulpaws", Description = "Home sitting for older or anxious pets.", Icon = "Sitting3.jpg", Location = "Viseu", Price = 90, Rating = 4.9f, Type = 3 },
            new Service { Name = "Play Pad", Slug = "playpad", Description = "Safe and fun daytime retreat for small pets.", Icon = "Daycare3.jpg", Location = "Porto", Price = 110, Rating = 4.4f, Type = 4 },
            new Service { Name = "Snout & Health", Slug = "snouthealth", Description = "Preventative vet visits and hygiene care.", Icon = "Care3.jpg", Location = "Aveiro", Price = 79, Rating = 4.6f, Type = 5 },

            new Service { Name = "Nap & Tail Inn", Slug = "naptailinn", Description = "Quiet hotel stay for shy pets.", Icon = "Hotel4.jpg", Location = "Coimbra", Price = 128, Rating = 4.7f, Type = 1 },
            new Service { Name = "Wander Paws", Slug = "wanderpaws", Description = "Guided walks for discovery and stimulation.", Icon = "Walk4.jpg", Location = "Leiria", Price = 61, Rating = 4.5f, Type = 2 },
            new Service { Name = "Home Snug", Slug = "homesnug", Description = "Caring home visits while you're away.", Icon = "Sitting4.jpg", Location = "Viseu", Price = 85, Rating = 4.8f, Type = 3 },
            new Service { Name = "Tail Time", Slug = "tailtime", Description = "Supervised play and learning in a daycare setting.", Icon = "Daycare4.jpg", Location = "Porto", Price = 115, Rating = 4.5f, Type = 4 },
            new Service { Name = "Whisker Wellness", Slug = "whiskerwellness", Description = "Focused on feline health and grooming.", Icon = "Care4.jpg", Location = "Aveiro", Price = 76, Rating = 4.7f, Type = 5 },

            new Service { Name = "Doggo Dreams", Slug = "doggodreams", Description = "Where doggy dreams come true during overnight stays.", Icon = "Hotel5.jpg", Location = "Coimbra", Price = 145, Rating = 4.6f, Type = 1 },
            new Service { Name = "Tails & Trails", Slug = "tailstrails", Description = "Fun, social, and scenic dog walks.", Icon = "Walk5.jpg", Location = "Leiria", Price = 63, Rating = 4.5f, Type = 2 },
            new Service { Name = "Couch Companions", Slug = "couchcompanions", Description = "Sitters who’ll treat your pet like their own.", Icon = "Sitting5.jpg", Location = "Viseu", Price = 92, Rating = 4.7f, Type = 3 },
            new Service { Name = "Ruff & Tumble", Slug = "rufftumble", Description = "Energetic daycare with toys, space, and staff.", Icon = "Daycare5.jpg", Location = "Porto", Price = 109, Rating = 4.6f, Type = 4 },
            new Service { Name = "Vital Pet", Slug = "vitalpet", Description = "Health and grooming to keep tails wagging.", Icon = "Care5.jpg", Location = "Aveiro", Price = 84, Rating = 4.8f, Type = 5 }

        };
    }
}
