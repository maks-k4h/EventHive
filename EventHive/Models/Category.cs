using System.ComponentModel.DataAnnotations;

namespace EventHive.Models;

public class Category
{
    [Display(Name = "Id")]
    [Required(ErrorMessage = "Category must have an id")]
    public int Id { get; set; }
    
    [Display(Name = "Title")]
    [Required(ErrorMessage = "Category must have a title")]
    [MaxLength(100, ErrorMessage = "The title is too long")]
    public string Title { get; set; } = null!;

    public virtual ICollection<CategoryEvent> CategoryEvents { get; set; } = new List<CategoryEvent>();
}