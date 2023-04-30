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
    public class PromoCodesController : ControllerBase
    {
        private readonly EventHiveContext _context;

        public PromoCodesController(EventHiveContext context)
        {
            _context = context;
        }

        // GET: api/PromoCodes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PromoCode>>> GetPromoCode()
        {
            if (_context.PromoCodes == null)
            {
              return NotFound();
            }
            return await _context.PromoCodes.ToListAsync();
        }

        // GET: api/PromoCodes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PromoCode>> GetPromoCode(int id)
        {
            if (_context.PromoCodes == null)
            {
              return NotFound();
            }
            var promoCode = await _context.PromoCodes.FindAsync(id);

            if (promoCode == null)
            {
                return NotFound();
            }

            return promoCode;
        }

        // POST: api/PromoCodes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PromoCode>> PostPromoCode(PromoCode promoCode)
        {
            if (_context.PromoCodes == null)
            {
              return Problem("Entity set 'EventHiveContext.PromoCode'  is null.");
            }

            if (await _context.TicketVaults.FindAsync(promoCode.TicketVaultId) == null)
            {
                return NotFound();
            }

            // normalize code
            promoCode.Code = promoCode.Code.Normalize();

            // check if . already exists
            if (await _context
                    .PromoCodes
                    .CountAsync(pc => pc.TicketVault == promoCode.TicketVault && pc.Code == promoCode.Code)
                > 0)
            {
                return Problem("Such a promo code already exists");
            }
            
            // check if discount is valid
            if (promoCode.Discount <= 0 || promoCode.Discount > 1)
            {
                return BadRequest("Discount must be a value withing (0; 1], where 1 means 100% discount");
            }
            
            _context.PromoCodes.Add(promoCode);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPromoCode", new { id = promoCode.Id }, promoCode);
        }

        // DELETE: api/PromoCodes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromoCode(int id)
        {
            if (_context.PromoCodes == null)
            {
                return NotFound();
            }
            var promoCode = await _context.PromoCodes.FindAsync(id);
            if (promoCode == null)
            {
                return NotFound();
            }

            _context.PromoCodes.Remove(promoCode);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool PromoCodeExists(int id)
        {
            return (_context.PromoCodes?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
