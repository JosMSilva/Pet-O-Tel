using Microsoft.EntityFrameworkCore;
using Pet_O_Tel.Server.Models;

namespace Pet_O_Tel.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Users> Users => Set<Users>();
    public DbSet<UserLogins> UserLogins => Set<UserLogins>();
    public DbSet<ServiceType> ServiceTypes => Set<ServiceType>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<PetHotel> PetHotel => Set<PetHotel>();
    public DbSet<Booking> Bookings => Set<Booking>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Users>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserLogins>()
            .HasIndex(ul => new { ul.Provider, ul.ProviderKey })
            .IsUnique();

        modelBuilder.Entity<UserLogins>()
            .HasOne(ul => ul.User)
            .WithMany(u => u.Logins)
            .HasForeignKey(ul => ul.UserId);

       

    }
}
