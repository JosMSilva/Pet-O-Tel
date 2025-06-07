using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pet_O_Tel.Server.Data;
using Pet_O_Tel.Server.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace Pet_O_Tel.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public UsersController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // **************************************** Login with Website ****************************************
    [HttpPost("login")]
    public async Task<IActionResult> EmailPasswordLogin([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            // Lookup user by email
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "User does not exist." });
            }

            // Check if user was registered via Google/GitHub and disallow password login
            if (user.Logins.Any(l => l.Provider != null && l.Provider != "Local"))
            {
                return Unauthorized(new { message = "This account uses a different login method." });
            }

            // Verify password
            var hasher = new PasswordHasher<Users>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            //Create Claims and SignIn Cookie
            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.FullName), new Claim(ClaimTypes.Email, user.Email) };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

            return Ok(new { message = "Logged in successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", details = ex.Message });
        }
    }

    // **************************************** Register with Website ****************************************

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            // Simple email validation
            if (!Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest(new { message = "Invalid email address." });
            }

            // Check if user already exists
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var hasher = new PasswordHasher<Users>();
            var user = new Users
            {
                Email = request.Email,
                FullName = request.FullName,
                PasswordHash = hasher.HashPassword(null, request.Password)
            };

            user.Logins.Add(new UserLogins
            {
                Provider = "Local",
                ProviderKey = hasher.HashPassword(null, request.Password),
                DisplayName = request.FullName
            });

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Registered successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", details = ex.Message });
        }
    }

    // **************************************** Login and Register with Google ****************************************

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            //Get Info from Web
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);

            //Set Basic Info
            string email = payload.Email; string name = payload.Name; string picture = payload.Picture;

            //Search for User in BD
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            //If no user with this email, register user
            if (user == null)
            {
                user = new Users
                {
                    Email = email,
                    FullName = name,
                    ProfileImageUrl = picture
                };

                user.Logins.Add(new UserLogins
                {
                    Provider = "Google",
                    ProviderKey = payload.Subject,
                    DisplayName = name
                });

                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            //Find user by email and Google login
            user = await _db.Users.Include(u => u.Logins).FirstOrDefaultAsync(u => u.Email == email &&u.Logins.Any(l => l.Provider == "Google"));

            //If user exists but has other login method, return error
            if (user == null)
            {
                return Unauthorized(new { message = "User already has an account with other method." });
            }

            //Create Claims and SignIn Cookie
            var claims = new List<Claim>{new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.FullName),new Claim(ClaimTypes.Email, user.Email)};
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,new ClaimsPrincipal(claimsIdentity));

            return Ok(new{message = "Logged in successfully"});
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { message = "Invalid Google token." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", details = ex.Message });
        }
    }

    // **************************************** Login and Register with GitHub ****************************************
    [HttpPost("github")]
    public async Task<IActionResult> GitHubLogin([FromBody] GitHubLoginRequest request)
    {
        //Get GitHub Client ID and Secret from configuration
        var clientId = _config["Authentication:GitHub:ClientId"];
        var clientSecret = _config["Authentication:GitHub:ClientSecret"];

        try
        {
            //Get Token from GitHub
            using var httpClient = new HttpClient();
            var tokenResponse = await httpClient.PostAsync("https://github.com/login/oauth/access_token", new FormUrlEncodedContent(new[] { new KeyValuePair<string?, string?>("client_id", clientId), new KeyValuePair<string?, string?>("client_secret", clientSecret), new KeyValuePair<string?, string?>("code", request.Code) }));
            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            var accessToken = System.Web.HttpUtility.ParseQueryString(tokenContent)["access_token"];
            if (accessToken == null) return Unauthorized(new { message = "Failed to get GitHub access token." });

            //Fetch GitHub user info
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PetOTelApp");
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            var userResponse = await httpClient.GetAsync("https://api.github.com/user");
            if (!userResponse.IsSuccessStatusCode) return Unauthorized(new { message = "Failed to fetch GitHub user profile." });

            //Fill User data
            var userJson = await userResponse.Content.ReadAsStringAsync();
            var githubUser = System.Text.Json.JsonDocument.Parse(userJson).RootElement;

            var githubId = githubUser.GetProperty("id").GetInt64().ToString(); //GitHub ID
            var name = githubUser.TryGetProperty("login", out var loginProp) ? loginProp.GetString() : null; // GitHub Username
            if (githubUser.TryGetProperty("name", out var nameProp) && !string.IsNullOrWhiteSpace(nameProp.GetString())) name = nameProp.GetString(); // Full Name from GitHub profile, if available
            var avatarUrl = githubUser.TryGetProperty("avatar_url", out var avatarProp) ? avatarProp.GetString() : null; // GitHub Avatar URL
            var email = githubUser.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null; // GitHub Email

            // If email is not provided in the user profile, fetch emails from GitHub API
            if (string.IsNullOrEmpty(email))
            {
                var emailResponse = await httpClient.GetAsync("https://api.github.com/user/emails");
                if (emailResponse.IsSuccessStatusCode)
                {
                    var emailsJson = await emailResponse.Content.ReadAsStringAsync();
                    var emails = System.Text.Json.JsonDocument.Parse(emailsJson).RootElement;

                    var primaryEmail = emails.EnumerateArray().FirstOrDefault(e => e.GetProperty("primary").GetBoolean()).GetProperty("email").GetString();
                    if (!string.IsNullOrEmpty(primaryEmail)) email = primaryEmail;
                }
            }

            if (string.IsNullOrEmpty(email)) return BadRequest(new { message = "GitHub email not found." });

            // Check if user already exists in the database
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            // If user does not exist, create a new user
            if (user == null)
            {
                user = new Users
                {
                    Email = email,
                    FullName = name,
                    ProfileImageUrl = avatarUrl
                };

                user.Logins.Add(new UserLogins
                {
                    Provider = "GitHub",
                    ProviderKey = githubId,
                    DisplayName = name
                });

                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            //Find user by email and GitHub login
            user = await _db.Users.Include(u => u.Logins).FirstOrDefaultAsync(u => u.Email == email && u.Logins.Any(l => l.Provider == "GitHub"));

            //If user exists but has other login method, return error
            if (user == null)
            {
                return Unauthorized(new { message = "User already has an account with other method." });
            }


            //Create Claims and SignIn Cookie
            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.FullName), new Claim(ClaimTypes.Email, user.Email) };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

            return Ok(new { message = "Logged in successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "GitHub login error", details = ex.Message });
        }
    }

    // **************************************** Logout and Delete Cookie ****************************************
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Logged out successfully" });
    }

    // **************************************** Get User Information ****************************************
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.Users.FindAsync(int.Parse(userId));
        if (user == null) return NotFound();

        return Ok(new { user.FullName, user.Email, user.ProfileImageUrl, user.Role });
    }


    [HttpPost("set-provider-role")]
    public async Task<IActionResult> SetProviderRole()
    {
        try
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == "jm.silva@ua.pt");
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.Role = "Provider"; 
            _db.Users.Update(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Role updated to 'Provider' for user {user.Email}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server error", details = ex.Message });
        }
    }




    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string Token { get; set; }
    }

    public class GitHubLoginRequest
    {
        public string Code { get; set; }
    }

}
