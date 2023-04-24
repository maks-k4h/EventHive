using System.ComponentModel.DataAnnotations;

namespace EventHive.Models;

public class Ticket
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Ticket must have an id")]
    public int Id { get; set; }
    
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Category must refer to a Ticket Vault")]
    public int TicketVaultId { get; set; }
    
    [Display(Name = "Holder")]
    [Required(ErrorMessage = "Ticket must have a holder")]
    [MaxLength(100, ErrorMessage = "Holder's name is too long")]
    public string Holed { get; set; } = null!;
    
    [Display(Name = "Paid price")]
    public double? PaidPrice { get; set; }
    
    [Display(Name = "Purchase time")]
    public DateTime? PurchaseTime { get; set; }

    [Display(Name = "Ticket Vault")]
    public virtual TicketVault? TicketVault { get; set; } = null;
}