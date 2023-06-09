using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EventHive.Models;

public class Category
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Category must have an id")]
    public int Id { get; set; }
    
    [Display(Name = "Name")]
    [Required(ErrorMessage = "Category must have a name")]
    [MinLength(1, ErrorMessage = "The name is too short")]
    [MaxLength(100, ErrorMessage = "The name is too long")]
    public string Name { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<CategoryEvent> CategoryEvents { get; set; } = new List<CategoryEvent>();
}