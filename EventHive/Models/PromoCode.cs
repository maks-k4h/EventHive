using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EventHive.Models;

public class PromoCode
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Promo code must have an id")]
    public int Id { get; set; }
    
    [Display(Name = "Ticket Vault Id")]
    [Required(ErrorMessage = "Promo code must refer to a ticket vault")]
    public int TicketVaultId { get; set; }

    [Display(Name = "Code")]
    [Required(ErrorMessage = "Promo code must have a code")]
    [MaxLength(50, ErrorMessage = "The code is too long")]
    public string Code { get; set; } = null!;
    
    [Display(Name = "Discount")]
    [Required(ErrorMessage = "Promo code must provide a discount")]
    public double Discount { get; set; }

    [JsonIgnore]
    public virtual TicketVault? TicketVault { get; set; } = null;
}