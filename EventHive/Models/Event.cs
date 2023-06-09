using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EventHive.Models;

public class Event
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Event must have an id")]
    public int Id { get; set; }

    [Required(ErrorMessage = "Event must have a name")]
    [Display(Name = "Title")]
    [MinLength(3, ErrorMessage = "The name is too short")]
    [MaxLength(100, ErrorMessage = "The name is too long")]
    public string Name { get; set; } = null!;

    [Display(Name = "Date and time")]
    public DateTime? DateAndTime { get; set; } = null;

    [Display(Name = "Description")]
    public string? Description { get; set; } = null;

    [JsonIgnore]
    public virtual ICollection<CategoryEvent> CategoryEvents { get; set; } = new List<CategoryEvent>();
}