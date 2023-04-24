using EventHive.Models;
using Microsoft.AspNetCore.Mvc;

namespace EventHive.Controllers;

[Route("/")]
[ApiController]
public class HomeController : Controller
{
    private readonly EventHiveContext _context;

    public HomeController(EventHiveContext context)
    {
        _context = context;
    }
    
    // GET
    [HttpGet]
    public IActionResult Index()
    {
        return Json(new Dictionary<string, string>
        {
            {"message", "Hello!"}
        });
    }
}