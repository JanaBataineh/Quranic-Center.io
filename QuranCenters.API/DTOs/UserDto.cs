using System;

namespace QuranCenters.API.DTOs
{
    public class UserDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string UserType { get; set; } // Student, Center, Admin
        public string CreatedAt { get; set; }
    }
}