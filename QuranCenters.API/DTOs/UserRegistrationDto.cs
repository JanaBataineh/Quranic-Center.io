namespace QuranCenters.API.DTOs
{
    public class UserRegistrationDto
    {
        public string FirstName { get; set; } = null!; // 
        public string MiddleName { get; set; } = null!; // 
        public string LastName { get; set; } = null!; // 
        public int Age { get; set; }
        
        public string Email { get; set; } = null!; // 
        public string Password { get; set; } = null!; // 
        public string UserType { get; set; } = null!; // 
    }
}