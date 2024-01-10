using System.ComponentModel.DataAnnotations;

namespace Core.Entities.Identity
{
    public class Address
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Street { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }

        // one to one relationship between user and address
        // entity framework will add the foreign key to connect to the app user table
        [Required]
        // required so the string can't be null duh
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

    }
}