using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranCenters.API.Data;
using QuranCenters.API.Models;

namespace QuranCenters.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // جلب ملاحظات الطالب
        [HttpGet("{studentId}")]
        public async Task<IActionResult> GetNotes(string studentId)
        {
            var notes = await _context.StudentNotes
                .Where(n => n.StudentId == studentId)
                .OrderByDescending(n => n.UpdatedAt)
                .ToListAsync();
            return Ok(notes);
        }

        // إنشاء ملاحظة جديدة فارغة
        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] StudentNote note)
        {
            note.UpdatedAt = DateTime.UtcNow;
            _context.StudentNotes.Add(note);
            await _context.SaveChangesAsync();
            return Ok(note);
        }

        // تحديث ملاحظة (للحفظ التلقائي)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] StudentNote note)
        {
            var existingNote = await _context.StudentNotes.FindAsync(id);
            if (existingNote == null) return NotFound();

            existingNote.Title = note.Title;
            existingNote.Content = note.Content;
            existingNote.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(existingNote);
        }
        
        // حذف ملاحظة
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
             var note = await _context.StudentNotes.FindAsync(id);
             if (note == null) return NotFound();
             
             _context.StudentNotes.Remove(note);
             await _context.SaveChangesAsync();
             return Ok();
        }
    }
}