using System.ComponentModel.DataAnnotations;

namespace EventHive.Models;

public class Event
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Event must have an id")]
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Event must have a name")]
    [Display(Name = "Title")]
    [MaxLength(100, ErrorMessage = "The name is too long")]
    public string Name { get; set; }

    [Display(Name = "Description")]
    public string? Description { get; set; } = null;

    public virtual ICollection<CategoryEvent> CategoryEvents { get; set; } = new List<CategoryEvent>();
}