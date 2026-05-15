using InteractHub_Shared.DTOs.Interactions;
using InteractHub_API.Services;
using InteractHub_Shared.Data;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;
[ApiController]
[Route("api/[controller]")]

public class InteractionController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IInteractionService _interactionService;
    public InteractionController(AppDbContext context, IInteractionService interactionService)
    {
        _context = context;
        _interactionService = interactionService;
    }

    [HttpPost("AddComment")]
    public async Task<IActionResult> AddComment([FromBody] CommentRequest request)
    {
       var response = await _interactionService.CommentAsync(request);
       if (response.isSuccess)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }

    [HttpPost("AddLike")]
    public async Task<IActionResult> AddLike([FromBody] LikeRequest request)
    {
       var response = await _interactionService.LikeAsync(request);
       if (response.isSuccess)
        {
            return Ok(response);
        }
        return BadRequest(response);
    }
}
