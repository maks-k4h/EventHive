using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EventHive.Models;

public class CategoryEvent
{
    [Display(Name = "Id")]
    public int Id { get; set; }
    
    [Display(Name = "Category's Id")]
    public int CategoryId { get; set; }
    
    [Display(Name = "Event's Id")]
    public int EventId { get; set; }
    
    [JsonIgnore]
    [Display(Name = "Category")]
    public virtual Category? Category { get; set; }
    
    [JsonIgnore]
    [Display(Name = "Event")]
    public virtual Event? Event { get; set; }
}