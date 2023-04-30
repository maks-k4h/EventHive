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
    public class TicketsController : ControllerBase
    {
        private readonly EventHiveContext _context;

        public TicketsController(EventHiveContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            if (_context.Tickets == null)
            {
              return NotFound();
            }
            return await _context.Tickets.ToListAsync();
        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            if (_context.Tickets == null)
            {
              return NotFound();
            }
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
        }

        // POST: api/Tickets/Purchase/3
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Purchase/{ticketVaultId}")]
        public async Task<ActionResult<Ticket>> PostTicket(int ticketVaultId, TicketOrder order)
        {
            if (_context.Tickets == null)
            {
              return Problem("Entity set 'EventHiveContext.Tickets'  is null.");
            }
            
            if (order.TicketVaultId != ticketVaultId)
            {
                return BadRequest("Order's vault ids don't match.");
            }

            // check if the vault exists
            var ticketVault = await _context.TicketVaults.FindAsync(order.TicketVaultId);
            if (ticketVault == null)
            {
                return NotFound();
            }

            // check if any tickets left
            if (ticketVault.TicketsLeft < 1)
            {
                return Problem("No tickets left.");
            }

            // check if holder's name is provided
            if (order.Holder.Trim().Length == 0)
            {
                return BadRequest("Ticket holder is not specified.");
            }

            // create ticket
            var ticket = new Ticket
            {
                Holder = order.Holder,
                PaidPrice = ticketVault.Price,
                PurchaseTime = DateTime.Now,
                TicketVaultId = order.TicketVaultId
            };
            
            // check promo codes
            var pmString = order.PromoCode?.Normalize();
            if (pmString != null)
            {
                var pm = await _context
                    .PromoCodes
                    .Where(p => p.Code == pmString && p.TicketVaultId == order.TicketVaultId)
                    .FirstOrDefaultAsync();
                if (pm == null)
                {
                    return BadRequest("No such promo code found.");
                }

                ticket.PaidPrice *= (1 - pm.Discount);
                ticket.PaidPrice = Double.Round(ticket.PaidPrice, 2);
            }
            
            // update Ticket Vault's counter
            ticketVault.TicketsLeft -= 1;
            
            // save changes
            _context.Tickets.Add(ticket);
            _context.TicketVaults.Update(ticketVault);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicket", new { id = ticket.Id }, ticket);
        }

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            if (_context.Tickets == null)
            {
                return NotFound();
            }
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool TicketExists(int id)
        {
            return (_context.Tickets?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
