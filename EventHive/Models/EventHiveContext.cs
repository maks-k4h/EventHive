using Microsoft.EntityFrameworkCore;

namespace EventHive.Models;

public class EventHiveContext : DbContext
{
    public virtual DbSet<Event> Events { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<CategoryEvent> CategoryEvents { get; set; }
    public virtual DbSet<TicketVault> TicketVaults { get; set; }
    public virtual DbSet<Ticket> Tickets { get; set; }

    public EventHiveContext(DbContextOptions<EventHiveContext> options)
    :base(options)
    {
        Database.EnsureCreated();
    }
}