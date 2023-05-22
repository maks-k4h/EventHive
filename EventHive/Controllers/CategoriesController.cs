using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventHive.Models;

namespace EventHive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly EventHiveContext _context;

        public CategoriesController(EventHiveContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            if (_context.Categories == null)
            {
              return NotFound();
            }
            return await _context.Categories.ToListAsync();
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            if (_context.Categories == null)
            {
              return NotFound();
            }
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // POST: api/Categories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            if (_context.Categories == null)
            {
              return Problem("Entity set 'EventHiveContext.Categories'  is null.");
            }
            
            if (category.Id > 0 && await _context.Categories.FindAsync(category.Id) != null)
            {
                return BadRequest("Category with such an id already exists.");
            }
            category.Name = category.Name.Trim();
            if (await _context.Categories.CountAsync(c => c.Name.ToLower() == category.Name.ToLower()) > 0)
            {
                return BadRequest("Such a category already exists.");
            }
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id, bool force = false)
        {
            if (_context.Categories == null)
            {
                return NotFound();
            }
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            if (!force && _context.CategoryEvents.Count(ce => ce.Category.Id == id) > 0)
            {
                return BadRequest("The category IS USED. If you still want to delete it, " +
                                  "use 'force=true'.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool CategoryExists(int id)
        {
            return (_context.Categories?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
