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
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TicketVaultsController : ControllerBase
    {
        private readonly EventHiveContext _context;

        public TicketVaultsController(EventHiveContext context)
        {
            _context = context;
        }

        // GET: api/TicketVaults?eventId=3
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketVault>>> GetTicketVaults(int? eventId = null)
        {
            if (_context.TicketVaults == null)
            {
              return NotFound();
            }
            
            if (eventId == null)
                return await _context.TicketVaults.ToListAsync();
            
            var res = await _context.TicketVaults.Where(tv => tv.EventId == eventId).ToListAsync();
            if (res.Count == 0)
                return NotFound();
            return res;
        }

        // GET: api/TicketVaults/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketVault>> GetTicketVault(int id)
        {
            if (_context.TicketVaults == null)
            {
              return NotFound();
            }
            var ticketVault = await _context.TicketVaults.FindAsync(id);

            if (ticketVault == null)
            {
                return NotFound();
            }

            return ticketVault;
        }

        // PUT: api/TicketVaults/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicketVault(int id, TicketVault ticketVault)
        {
            if (id != ticketVault.Id)
            {
                return BadRequest();
            }
            
            var tv = await _context.TicketVaults.FindAsync(ticketVault.Id);
            if (tv == null)
            {
                return NotFound();
            }

            // check if eventId's are the same
            if (tv.EventId != ticketVault.EventId)
            {
                return BadRequest("Cannot change eventId.");
            }

            // check if this event already has ticket vault with such a title
            ticketVault.Title = ticketVault.Title.Trim();
            if (await _context.TicketVaults.CountAsync(tv => tv.EventId == ticketVault.EventId && tv.Id != id && tv.Title.ToLower() == ticketVault.Title.ToLower()) > 0)
            {
                return BadRequest("This event already has a ticket vault with such name.");
            }
            
            // check price
            if (ticketVault.Price < 0)
            {
                return BadRequest("Price cannot be negative.");
            }
            
            // check total tickets
            if (ticketVault.TotalTickets is < 0)
            {
                return BadRequest("Total number of tickets cannot be negative");
            }
            
            // check tickets left
            if (ticketVault.TicketsLeft is < 0 ||
                (ticketVault.TotalTickets != null && ticketVault.TicketsLeft > ticketVault.TotalTickets))
            {
                return BadRequest("Invalid number of tickets left");
            }

            // save changes
            _context.Entry(tv).State = EntityState.Detached;
            _context.Entry(ticketVault).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // POST: api/TicketVaults
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TicketVault>> PostTicketVault(TicketVault ticketVault)
        {
            if (_context.TicketVaults == null)
            { 
                return Problem("Entity set 'EventHiveContext.TicketVaults'  is null.");
            }
            
            if (ticketVault.Id > 0 && TicketVaultExists(ticketVault.Id))
            {
                return BadRequest("Ticket Vault's id is not available.");
            }
            
            if (await _context.Events.FindAsync(ticketVault.EventId) == null)
            {
                return BadRequest("No such event found.");
            }
            
            // check if this event already has ticket vault with such a title
            ticketVault.Title = ticketVault.Title.Trim();
            if (await _context.TicketVaults.CountAsync(tv => tv.EventId == ticketVault.EventId && tv.Title.ToLower() == ticketVault.Title.ToLower()) > 0)
            {
                return BadRequest("This event already has a ticket vault with such name.");
            }
            
            // check price
            if (ticketVault.Price < 0)
            {
                return BadRequest("Price cannot be negative.");
            }
            
            // check total tickets
            if (ticketVault.TotalTickets is < 0)
            {
                return BadRequest("Total number of tickets cannot be negative");
            }
            
            // check tickets left
            if (ticketVault.TicketsLeft is < 0 ||
                (ticketVault.TotalTickets != null && ticketVault.TicketsLeft > ticketVault.TotalTickets))
            {
                return BadRequest("Invalid number of tickets left");
            }
            
            _context.TicketVaults.Add(ticketVault);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicketVault", new { id = ticketVault.Id }, ticketVault);
        }

        // DELETE: api/TicketVaults/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicketVault(int id)
        {
            if (_context.TicketVaults == null)
            {
                return NotFound();
            }
            var ticketVault = await _context.TicketVaults.FindAsync(id);
            if (ticketVault == null)
            {
                return NotFound();
            }

            _context.TicketVaults.Remove(ticketVault);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool TicketVaultExists(int id)
        {
            return (_context.TicketVaults?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
