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

            _context.Entry(ticketVault).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketVaultExists(id))
                {
                    return NotFound();
                }
                if (await _context.Events.FindAsync(ticketVault.EventId) == null)
                {
                    return BadRequest("No such event found.");
                }
                
                throw;
            }

            return NoContent();
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
