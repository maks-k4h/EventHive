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
    public class EventsController : ControllerBase
    {
        private readonly EventHiveContext _context;

        public EventsController(EventHiveContext context)
        {
            _context = context;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            if (_context.Events == null)
            {
              return NotFound();
            }
            return await _context.Events.ToListAsync();
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            if (_context.Events == null)
            {
              return NotFound();
            }
            var @event = await _context.Events.FindAsync(id);

            if (@event == null)
            {
                return NotFound();
            }

            return @event;
        }

        // PUT: api/Events/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, Event @event)
        {
            if (id != @event.Id)
            {
                return BadRequest();
            }

            _context.Entry(@event).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // POST: api/Events
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event @event)
        {
            if (_context.Events == null)
            {  
                return Problem("Entity set 'EventHiveContext.Events'  is null.");
            }
            
            if (@event.Id > 0 && await _context.Events.FindAsync(@event.Id) != null)
            {
                return BadRequest("Event with such an id already exists.");
            }
            _context.Events.Add(@event);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEvent", new { id = @event.Id }, @event);
        }

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            if (_context.Events == null)
            {
                return NotFound();
            }
            var @event = await _context.Events.FindAsync(id);
            if (@event == null)
            {
                return NotFound();
            }

            _context.Events.Remove(@event);
            await _context.SaveChangesAsync();

            return Ok();
        }
        
        // GET: api/Events/5/Categories
        [HttpGet("{eventId}/Categories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetEventCategories(int eventId)
        {
            if (_context.Categories == null || _context.CategoryEvents == null)
            {
                return NotFound();
            }

            var categories = _context
                .CategoryEvents
                .Where(ce => ce.EventId == eventId)
                .Join(_context.Categories, ce => ce.CategoryId, c => c.Id, (ce, c) => c);

            return await categories.ToListAsync();
        }
        
        // POST: api/Events/5/Categories/3
        [HttpPost("{eventId}/Categories/{categoryId}")]
        public async Task<IActionResult> PostEventCategories(int eventId, int categoryId)
        {
            if (_context.Events == null || _context.Categories == null || _context.CategoryEvents == null)
            {
                return NotFound();
            }
            
            // check if the event exists
            var @event = await _context.Events.FindAsync(eventId);
            if (@event == null)
            {
                return NotFound();
            }
            
            // check if the category exists
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return BadRequest("Cannot add non-existent category.");
            }
            
            // check if this event already has this category
            if (_context.CategoryEvents.Count(ce => ce.EventId == eventId && ce.CategoryId == categoryId) > 0)
            {
                return BadRequest("This event already has such a category.");
            }
            
            // add new record
            var ca = new CategoryEvent { EventId = eventId, CategoryId = categoryId };
            _context.CategoryEvents.Add(ca);
            await _context.SaveChangesAsync();

            return Ok();
        }
        
        // DELETE: api/Events/5/Categories/3
        [HttpDelete("{eventId}/Categories/{categoryId}")]
        public async Task<IActionResult> DeleteEventCategories(int eventId, int categoryId)
        {
            if (_context.CategoryEvents == null)
            {
                return NotFound();
            }

            var ca = await _context
                .CategoryEvents
                .Where(ce => ce.EventId == eventId && ce.CategoryId == categoryId)
                .FirstOrDefaultAsync();
            if (ca == null)
            {
                return NotFound();
            }

            _context.CategoryEvents.Remove(ca);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool EventExists(int id)
        {
            return (_context.Events?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
