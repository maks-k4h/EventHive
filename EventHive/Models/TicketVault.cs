using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace EventHive.Models;

public class TicketVault
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Ticket Vault must have an id")]
    public int Id { get; set; }
    
    [Display(Name = "Ticket Id")]
    [Required(ErrorMessage = "Ticket vault must refer to an event")]
    public int EventId { get; set; }

    [Display(Name = "Ticket type")]
    [Required(ErrorMessage = "Ticket type must have a title")]
    [MaxLength(100, ErrorMessage = "Ticket type's title is too long")]
    public string Title { get; set; } = null!;

    [Display(Name = "Ticket price")]
    public double? Price { get; set; }

    [Display(Name = "Total tickets")]
    public int? TotalTickets { get; set; }
    
    [Display(Name = "Tickets left")]
    public int? TicketsLeft { get; set; }

    [Display(Name = "Event")]
    public virtual Event? Event { get; set; } = null;
    
    [Display(Name = "Tickets")]
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    [Display(Name = "Promo codes")]
    public virtual ICollection<PromoCode> PromoCodes { get; set; } = new List<PromoCode>();
}