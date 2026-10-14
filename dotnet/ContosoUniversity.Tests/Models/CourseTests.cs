using System.ComponentModel.DataAnnotations;
using ContosoUniversity.Core.Models;
using Xunit;

namespace ContosoUniversity.Tests.Models
{
    public class CourseTests
    {
        [Fact]
        public void MaxEnrollment_DefaultValue_Is30()
        {
            var course = new Course();

            Assert.Equal(30, course.MaxEnrollment);
        }

        [Theory]
        [InlineData(0, false)]
        [InlineData(1, true)]
        public void MaxEnrollment_Value_ValidationMatchesPositiveCapacityRequirement(int maxEnrollment, bool expectedValid)
        {
            var course = new Course { MaxEnrollment = maxEnrollment };
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(course)
            {
                MemberName = nameof(Course.MaxEnrollment)
            };

            var isValid = Validator.TryValidateProperty(course.MaxEnrollment, validationContext, validationResults);

            Assert.Equal(expectedValid, isValid);
        }
    }
}
