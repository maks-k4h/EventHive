namespace EventHive.Models;

public class TicketOrder
{
    public string Holder { get; set; } = null!;

    public int TicketVaultId { get; set; }

    public string? PromoCode { get; set; } = null;
}